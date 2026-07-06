import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('buy/:productId')
  buy(@Param('productId') productId: string, @Body('userId') userId: string) {
    return this.transactionsService.buyProduct(+productId, userId);
  }

  @Post('confirm/:id')
  confirm(@Param('id') id: string, @Body('userId') userId: string) {
    return this.transactionsService.confirmReception(id, userId);
  }

  @Post('me')
  getMine(@Body('userId') userId: string) {
    return this.transactionsService.getUserTransactions(userId);
  }

  @Get('fees')
  getFees() {
    return this.transactionsService.getFees();
  }
}

