import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async register(userData: Partial<User>): Promise<User> {
    const existing = await this.usersRepository.findOne({ where: { email: userData.email } });
    if (existing) throw new ConflictException('Email existe déjà');
    
    // Cryptage du mot de passe avec bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    const newUser = this.usersRepository.create({
      ...userData,
      password: hashedPassword
    });
    return this.usersRepository.save(newUser);
  }

  async login(credentials: any): Promise<{ token: string }> {
    console.log('--- Tentative de connexion ---');
    console.log('OEmail:', credentials.email);
    console.log('OMot de passe reçu (longueur):', credentials.password?.length);

    const user = await this.usersRepository.findOne({ where: { email: credentials.email } });
    
    if (!user) {
      console.log('-> Échec : Utilisateur introuvable en base de données.');
      throw new UnauthorizedException('Identifiants invalides');
    }

    // On vérifie le mot de passe crypté (ou l'ancien en clair pour le compte test)
    let isMatch = false;
    if (user.password === credentials.password) {
      isMatch = true; // Ancien cas "test" non-crypté
    } else {
      isMatch = await bcrypt.compare(credentials.password, user.password); // Nouveau cas crypté
    }

    if (!isMatch) {
      console.log('-> Échec : Mot de passe incorrect.');
      throw new UnauthorizedException('Identifiants invalides');
    }

    console.log('-> Succès ! Authentifié.');
    return { token: 'fake-jwt-token-12345' };
  }
}
