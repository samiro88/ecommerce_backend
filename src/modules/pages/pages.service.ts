import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import { v2 as cloudinary } from 'cloudinary';
  import { CreatePageDto } from '../dto/create-page.dto';
  import { UpdatePageDto } from '../dto/update-page.dto';
  import { Page } from '../../models/page.schema';
  
  @Injectable()
  export class PagesService {
    constructor(@InjectModel(Page.name) private pageModel: Model<Page>) {}
  
    async getAllPages() {
      try {
        const pages = await this.pageModel
          .find({})
          .sort('-createdAt')
          .select('title cover.url createdAt updatedAt body excerpt meta_description meta_keywords author_id image slug status')
          .exec();
        return {
          message: 'Pages fetched successfully',
          data: pages,
        };
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
  
    async createPage(createPageDto: CreatePageDto) {
      try {
        console.log('Creating page with data:', createPageDto);
        const cleanData = Object.fromEntries(
          Object.entries(createPageDto).filter(([_, value]) => value !== undefined && value !== '')
        );
        console.log('Final page data:', cleanData);
        const newPage = new this.pageModel(cleanData);
        await newPage.save();
        return {
          message: 'Page created successfully',
          data: newPage,
        };
      } catch (error) {
        throw new BadRequestException(
          error.message || 'Error creating page',
        );
      }
    }
  
    async deletePage(id: string) {
      try {
        const page = await this.pageModel.findById(id);
  
        if (!page) {
          throw new NotFoundException('Page not found');
        }
  
        if (page.cover && page.cover.img_id) {
          await cloudinary.uploader.destroy(page.cover.img_id);
        }
  
        await this.pageModel.findByIdAndDelete(id);
        return {
          message: 'Page deleted successfully',
        };
      } catch (error) {
        throw new BadRequestException(
          error.message || 'Error deleting page',
        );
      }
    }
  
    async updatePage(
      id: string,
      updatePageDto: UpdatePageDto,
    ) {
      try {
        console.log('Updating page with data:', updatePageDto);
        const page = await this.pageModel.findById(id);
        if (!page) {
          throw new NotFoundException('Page not found');
        }
        const cleanData = Object.fromEntries(
          Object.entries(updatePageDto).filter(([_, value]) => value !== undefined && value !== '')
        );
        console.log('Final update data:', cleanData);
        const updatedPage = await this.pageModel.findByIdAndUpdate(
          id,
          cleanData,
          { new: true, runValidators: true },
        );
        return {
          message: 'Page updated successfully',
          data: updatedPage,
        };
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
  
    async getPageById(id: string) {
      try {
        const page = await this.pageModel.findById(id).select('-_id -cover.img_id');
        if (!page) {
          throw new NotFoundException('Page not found');
        }
  
        return {
          message: 'Page fetched successfully',
          data: page,
        };
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
  
    async getPageBySlug(slug: string) {
      try {
        const page = await this.pageModel.findOne({ slug }).select('-_id -cover.img_id');
        if (!page) {
          throw new NotFoundException('Page not found');
        }
  
        return {
          message: 'Page fetched successfully',
          data: page,
        };
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
  }