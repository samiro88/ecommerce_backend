import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PackConfig, PackConfigDocument } from '../models/pack-config.schema';

@Controller('pack')
export class PackConfigController {
  constructor(
    @InjectModel(PackConfig.name) private packConfigModel: Model<PackConfigDocument>,
  ) {}

  @Get('config')
  async getConfig() {
    try {
      let config = await this.packConfigModel.findOne().exec();
      if (!config) {
        config = new this.packConfigModel({});
        await config.save();
      }
      return config;
    } catch (error) {
      throw new HttpException('Failed to get configuration', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('config')
  async updateConfig(@Body() configData: any) {
    try {
      let config = await this.packConfigModel.findOne().exec();
      if (!config) {
        config = new this.packConfigModel(configData);
      } else {
        Object.assign(config, configData);
      }
      await config.save();
      
      return {
        success: true,
        message: 'Configuration updated successfully',
        data: config
      };
    } catch (error) {
      throw new HttpException('Failed to update configuration', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}