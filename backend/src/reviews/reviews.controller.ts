import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async createReview(
    @Body('reviewerId') reviewerId: string,
    @Body('revieweeId') revieweeId: string,
    @Body('transactionId') transactionId: string,
    @Body('rating') rating: number,
    @Body('comment') comment: string
  ) {
    return this.reviewsService.createReview(reviewerId, revieweeId, transactionId, rating, comment);
  }

  @Get('user/:id')
  async getUserReviews(@Param('id') userId: string) {
    return this.reviewsService.getUserReviews(userId);
  }
}
