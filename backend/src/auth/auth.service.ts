import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async register(userData: Partial<User>): Promise<User> {
    const existing = await this.usersRepository.findOne({ where: { email: userData.email } });
    if (existing) throw new ConflictException('Email existe déjà');
    
    // Pour l'exercice: pas de hash de mot de passe, mais on le ferait ici en temps normal avec bcrypt
    const newUser = this.usersRepository.create(userData);
    return this.usersRepository.save(newUser);
  }

  async login(credentials: any): Promise<{ token: string }> {
    const user = await this.usersRepository.findOne({ where: { email: credentials.email } });
    if (!user || user.password !== credentials.password) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    // Simulation simple de token pour garder ça rapide
    return { token: 'fake-jwt-token-12345' };
  }
}
