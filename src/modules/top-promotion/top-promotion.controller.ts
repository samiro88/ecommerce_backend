import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { TopPromotionService } from './top-promotion.service';

@Controller('top-promotions')
export class TopPromotionController {
  constructor(private readonly topPromotionService: TopPromotionService) {}

  @Get()
  async getAll() {
    return this.topPromotionService.getAllTopPromotions();
  }

  @Get('active')
  async getActive() {
    return this.topPromotionService.getActiveTopPromotions();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.topPromotionService.getTopPromotionById(id);
  }

  @Post()
  async create(@Body() dto: any) {
    return this.topPromotionService.createTopPromotion(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.topPromotionService.updateTopPromotion(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.topPromotionService.deleteTopPromotion(id);
  }
}