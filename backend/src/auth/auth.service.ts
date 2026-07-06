import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(userData: Partial<User>): Promise<User> {
    const existing = await this.usersRepository.findOne({ where: { email: userData.email } });
    if (existing) throw new ConflictException('Email existe déjà');
    
    if (userData.password) {
      const saltRounds = 10;
      userData.password = await bcrypt.hash(userData.password, saltRounds);
    }

    const newUser = this.usersRepository.create(userData);
    return await this.usersRepository.save(newUser);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { id: id as any }, 
      select: ['id', 'pseudo', 'email', 'credits', 'pending_credits', 'role', 'description'] 
    });
  }

  async refill(userId: string, amount: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId as any } });
    if (!user) throw new UnauthorizedException('Utilisateur inexistant');
    user.credits = Number(user.credits) + Number(amount);
    return await this.usersRepository.save(user);
  }

  async login(credentials: any): Promise<any> {
    console.log('--- Connexion Sécurisée (JWT) ---');
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: credentials.email })
      .addSelect('user.password')
      .getOne();
    
    if (!user) throw new UnauthorizedException('Inexistant');

    let isMatch = false;
    if (user.password === credentials.password) {
      isMatch = true;
    } else {
      isMatch = await bcrypt.compare(credentials.password, user.password);
    }

    if (!isMatch) throw new UnauthorizedException('Identifiants invalides');

    const payload = { email: user.email, sub: user.id, role: user.role };
    
    return { 
      token: this.jwtService.sign(payload),
      id: user.id,
      pseudo: user.pseudo,
      role: user.role,
      credits: user.credits,
      pending_credits: user.pending_credits,
      description: user.description
    };
  }

  async getPublicProfile(id: string): Promise<Partial<User>> {
    const user = await this.usersRepository.findOne({ 
      where: { id: id as any }, 
      select: ['id', 'pseudo', 'description', 'created_at'] 
    });
    if (!user) throw new UnauthorizedException('Utilisateur introuvable');
    return user;
  }

  async updateDescription(id: string, description: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: id as any } });
    if (!user) throw new UnauthorizedException('Utilisateur introuvable');
    user.description = description;
    return await this.usersRepository.save(user);
  }
}
