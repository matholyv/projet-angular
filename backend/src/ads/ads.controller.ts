import { Controller, Get, Post, Body, Param, Delete, Patch, Query, ParseUUIDPipe } from '@nestjs/common';
import { AdsService } from './ads.service';
import { Ad } from './entities/ad.entity';

@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Get()
  async findAll(): Promise<Ad[]> {
    return this.adsService.findAll();
  }

  @Get('search')
  async search(
    @Query('categoryId') categoryId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ): Promise<Ad[]> {
    return this.adsService.findFiltered(
      categoryId ? parseInt(categoryId, 10) : undefined,
      minPrice ? parseFloat(minPrice) : undefined,
      maxPrice ? parseFloat(maxPrice) : undefined,
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Ad> {
    return this.adsService.findOne(id);
  }

  @Post()
  async create(@Body() adData: Partial<Ad>): Promise<Ad> {
    return this.adsService.create(adData);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() adData: Partial<Ad>,
  ): Promise<Ad> {
    return this.adsService.update(id, adData);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.adsService.remove(id);
  }
}
