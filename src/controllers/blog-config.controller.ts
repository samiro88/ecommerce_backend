import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogConfig, BlogConfigDocument } from '../models/blog-config.schema';

@Controller('blog')
export class BlogConfigController {
  constructor(
    @InjectModel(BlogConfig.name) private blogConfigModel: Model<BlogConfigDocument>,
  ) {}

  @Get('config')
  async getConfig() {
    try {
      let config = await this.blogConfigModel.findOne().exec();
      if (!config) {
        config = new this.blogConfigModel({});
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
      let config = await this.blogConfigModel.findOne().exec();
      if (!config) {
        config = new this.blogConfigModel(configData);
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