import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';

@Controller('vente-flash')
export class VenteFlashConfigController {
  @Post('config')
  async updateConfig(@Body() configData: any) {
    try {
      console.log('VenteFlash config updated:', configData);
      
      // Here you can save to database, file, or cache
      // For now, just return success
      return {
        success: true,
        message: 'Configuration updated successfully',
        data: configData
      };
    } catch (error) {
      throw new HttpException(
        'Failed to update configuration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}