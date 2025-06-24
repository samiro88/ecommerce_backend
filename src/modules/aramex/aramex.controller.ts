import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { AramexService } from './aramex.service';
import { CreateShipmentDto } from '../dto/create-shipment.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Aramex Integration')
@Controller('aramex')
export class AramexController {
  constructor(private readonly aramexService: AramexService) {}

  @Post('shipment')
  @ApiOperation({ summary: 'Create new shipment' })
  @ApiResponse({ status: 201, description: 'Shipment created successfully' })
  async createShipment(@Body() createShipmentDto: CreateShipmentDto) {
    return this.aramexService.createShipment(createShipmentDto);
  }

  @Get('track/:awb')
  @ApiOperation({ summary: 'Track shipment by AWB' })
  async trackShipment(@Param('awb') awb: string) {
    return this.aramexService.trackShipment(awb);
  }

  @Post('return/:awb')
  @ApiOperation({ summary: 'Create return shipment' })
  async createReturn(@Param('awb') awb: string) {
    return this.aramexService.createReturnShipment(awb);
  }
}