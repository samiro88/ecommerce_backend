import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TestimonialConfig, TestimonialConfigDocument } from '../models/testimonial-config.schema';

@Controller('testimonial')
export class TestimonialConfigController {
  constructor(
    @InjectModel(TestimonialConfig.name) private testimonialConfigModel: Model<TestimonialConfigDocument>,
  ) {}

  @Get('config')
  async getConfig() {
    try {
      let config = await this.testimonialConfigModel.findOne().exec();
      if (!config) {
        config = new this.testimonialConfigModel({});
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
      let config = await this.testimonialConfigModel.findOne().exec();
      if (!config) {
        config = new this.testimonialConfigModel(configData);
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