import {
    Controller,
    Get,
    Post,
    Put,
    Param,
    Body,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { PromoCodesService } from './promo-codes.service';
  
  @Controller('admin/promo-codes') // Maintaining /admin prefix
  export class PromoCodesController {
    constructor(private readonly promoCodesService: PromoCodesService) {}
  
    @Get('get/all')
    async getPromoCodes() {
      try {
        return await this.promoCodesService.getPromoCodes();
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get('get/:id')
    async getPromoCodeById(@Param('id') id: string) {
      try {
        return await this.promoCodesService.getPromoCodeById(id);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Post('new')
    async createPromoCode(@Body() body: any) {
      try {
        return await this.promoCodesService.createPromoCode(body);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Put('update/:id')
    async updatePromoCode(@Param('id') id: string, @Body() body: any) {
      try {
        return await this.promoCodesService.updatePromoCode(id, body);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Post('delete/many')
    async deletePromoCodes(@Body() body: string[]) {
      try {
        return await this.promoCodesService.deletePromoCodes(body);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get('validate/:code')
    async validatePromoCode(@Param('code') code: string) {
      try {
        return await this.promoCodesService.validatePromoCode(code);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }