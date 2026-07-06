import { Controller, Post, Body, Get, Param } from '@nestjs/common';
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

  @Get('user/:id')
  getUser(@Param('id') id: string) {
    return this.authService.findById(id);
  }

  @Get('public/:id')
  getPublicProfile(@Param('id') id: string) {
    return this.authService.getPublicProfile(id);
  }

  @Post('user/:id/description')
  updateDescription(@Param('id') id: string, @Body() body: { description: string }) {
    return this.authService.updateDescription(id, body.description);
  }

  @Post('refill')
  refill(@Body() body: { userId: string; amount: number }) {
    return this.authService.refill(body.userId, body.amount);
  }
}
