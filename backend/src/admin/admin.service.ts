import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Transaction, TransactionStatus } from '../transactions/entities/transaction.entity';
import { Product } from '../ads/entities/ad.entity';
import { Setting } from './entities/setting.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    private readonly notificationsService: NotificationsService
  ) {}

  async getStats() {
    const totalUsers = await this.userRepository.count();
    const totalAds = await this.productRepository.count();
    
    // Pour calculer les bénéfices, on somme les 'fee' des transactions terminées
    const { totalSales, totalRevenue } = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COUNT(transaction.id)', 'totalSales')
      .addSelect('SUM(transaction.fee)', 'totalRevenue')
      .where('transaction.status = :status', { status: TransactionStatus.COMPLETED })
      .getRawOne();

    return {
      totalUsers,
      totalAds,
      totalSales: parseInt(totalSales || '0', 10),
      totalRevenue: parseFloat(totalRevenue || '0')
    };
  }

  async getUsers() {
    return this.userRepository.find({
      select: ['id', 'email', 'pseudo', 'role', 'credits', 'created_at'],
      order: { created_at: 'DESC' }
    });
  }

  async updateCredits(userId: string, amount: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    user.credits = Number(user.credits) + Number(amount);
    if (user.credits < 0) {
      user.credits = 0; // Prevent negative balance
    }
    await this.userRepository.save(user);

    return { message: 'Solde mis à jour', credits: user.credits };
  }
  
  async getPlatformSettings() {
    let setting = await this.settingRepository.findOne({ where: { id: 1 } });
    if (!setting) {
      setting = this.settingRepository.create({ id: 1, feePercentage: 5.00, feeFixed: 0.50 });
      await this.settingRepository.save(setting);
    }
    return setting;
  }

  async updatePlatformSettings(feePercentage: number, feeFixed: number) {
    let setting = await this.getPlatformSettings();
    setting.feePercentage = feePercentage;
    setting.feeFixed = feeFixed;
    const savedSetting = await this.settingRepository.save(setting);
    
    // Fetch all users to send individual notifications
    const users = await this.userRepository.find();
    
    // Create notifications sequentially (or use Promise.all for optimization)
    for (const user of users) {
      await this.notificationsService.createNotification(
        user.id,
        'Frais mis à jour 🛠️',
        `Les frais de la plateforme ont été mis à jour à ${feePercentage}% + ${feeFixed}€ par transaction.`,
        'SYSTEM',
        '/'
      );
    }
    
    return savedSetting;
  }
}
