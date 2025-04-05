import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    ParseArrayPipe,
  } from '@nestjs/common';
  import { PromoCodesService } from './promo-codes.service';
  import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
  import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
  
  @Controller('promo-codes')
  export class PromoCodesController {
    constructor(private readonly promoCodesService: PromoCodesService) {}
  
    @Get()
    async getAllPromoCodes() {
      return this.promoCodesService.getAllPromoCodes();
    }
  
    @Post()
    async createPromoCode(@Body() createPromoCodeDto: CreatePromoCodeDto) {
      return this.promoCodesService.createPromoCode(createPromoCodeDto);
    }
  
    @Get(':id')
    async getPromoCodeById(@Param('id') id: string) {
      return this.promoCodesService.getPromoCodeById(id);
    }
  
    @Put(':id')
    async updatePromoCode(
      @Param('id') id: string,
      @Body() updatePromoCodeDto: UpdatePromoCodeDto,
    ) {
      return this.promoCodesService.updatePromoCode(id, updatePromoCodeDto);
    }
  
    @Delete()
    async deletePromoCodes(@Body('ids', ParseArrayPipe) ids: string[]) {
      return this.promoCodesService.deletePromoCodes(ids);
    }
  }