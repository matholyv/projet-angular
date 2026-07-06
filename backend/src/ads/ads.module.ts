import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdsController } from './ads.controller';
import { AdsService } from './ads.service';
import { Product } from './entities/ad.entity';
import { User } from '../auth/entities/user.entity'; // On récupère l'utilisateur !

@Module({
  imports: [TypeOrmModule.forFeature([Product, User])], // On branche les DEUX !
  controllers: [AdsController],
  providers: [AdsService],
  exports: [AdsService],
})
export class AdsModule {}
