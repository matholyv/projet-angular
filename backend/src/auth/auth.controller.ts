import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() userData: any) {
    return this.authService.register(userData);
  }

  @Post('login')
  login(@Body() credentials: any) {
    return this.authService.login(credentials);
  }
}
