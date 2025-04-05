import {
    Controller,
    Post,
    Get,
    Put,
    Delete,
    Param,
    Body,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { VentesService } from './ventes.service';
  
  @Controller('ventes')
  export class VentesController {
    constructor(private readonly ventesService: VentesService) {}
  
    @Post('new')
    async createVente(@Body() body: any) {
      try {
        return await this.ventesService.createVente(body);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Post('commande/new')
    async createCommandeVente(@Body() body: any) {
      try {
        return await this.ventesService.createCommandeVente(body);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get('get/all')
    async getAllVentes() {
      try {
        return await this.ventesService.getAllVentes();
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Put('update-status/:id')
    async updateVenteStatus(@Param('id') id: string, @Body() body: any) {
      try {
        return await this.ventesService.updateVenteStatus(id, body);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get('get/:id')
    async getVenteById(@Param('id') id: string) {
      try {
        return await this.ventesService.getVenteById(id);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Delete('delete/:id')
    async deleteVente(@Param('id') id: string) {
      try {
        return await this.ventesService.deleteVente(id);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Post('delete/many')
    async deleteVenteMany(@Body() body: string[]) {
      try {
        return await this.ventesService.deleteVenteMany(body);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Put('update/:id')
    async updateVente(@Param('id') id: string, @Body() body: any) {
      try {
        return await this.ventesService.updateVente(id, body);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }