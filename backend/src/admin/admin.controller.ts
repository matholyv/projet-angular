import { Controller, Get, Post, Body, Param, ForbiddenException, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';

@Controller('api/admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  private async verifyAdmin(userId: string) {
    if (!userId) throw new ForbiddenException("Utilisateur non authentifié.");
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException("Accès refusé. Rôle administrateur requis.");
    }
  }

  @Post('stats')
  async getStats(@Body('userId') userId: string) {
    await this.verifyAdmin(userId);
    return this.adminService.getStats();
  }

  @Post('users')
  async getUsers(@Body('userId') userId: string) {
    await this.verifyAdmin(userId);
    return this.adminService.getUsers();
  }

  @Post('users/:id/credits')
  async updateCredits(
    @Param('id') id: string, 
    @Body('amount') amount: number,
    @Body('userId') adminId: string
  ) {
    await this.verifyAdmin(adminId);
    return this.adminService.updateCredits(id, amount);
  }
  @Post('settings')
  async getSettings(@Body('userId') userId: string) {
    await this.verifyAdmin(userId);
    return this.adminService.getPlatformSettings();
  }

  @Post('settings/update')
  async updateSettings(
    @Body('userId') userId: string,
    @Body('feePercentage') feePercentage: number,
    @Body('feeFixed') feeFixed: number
  ) {
    await this.verifyAdmin(userId);
    return this.adminService.updatePlatformSettings(feePercentage, feeFixed);
  }
}
