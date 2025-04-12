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
import { VentesService } from '../../controllers/vente/vente.service'; // Correct path

@Controller('ventes')
export class VentesController {
  constructor(private readonly ventesService: VentesService) {}

  @Post('new')
  async createVente(@Body() body: any) {
    try {
      return await this.ventesService.create(body); // Matches the `create` method in VentesService
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
      return await this.ventesService.createCommande(body); // Matches the `createCommande` method in VentesService
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
      return await this.ventesService.findAll(); // Matches the `findAll` method in VentesService
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
      return await this.ventesService.updateStatus(id, body.status); // Matches the `updateStatus` method in VentesService
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
      return await this.ventesService.findOne(id); // Matches the `findOne` method in VentesService
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
      return await this.ventesService.remove(id); // Matches the `remove` method in VentesService
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
      return await this.ventesService.removeMany(body); // Matches the `removeMany` method in VentesService
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
      return await this.ventesService.update(id, body); // Matches the `update` method in VentesService
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}