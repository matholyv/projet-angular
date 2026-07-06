import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService, private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'super-secret-key-for-2ndmain-app-2026',
    });
  }

  async validate(payload: any) {
    console.log('JWT PAYLOAD:', payload); const user = await this.authService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non autorisé');
    }
    return user; // Le user est injecté dans req.user
  }
}
