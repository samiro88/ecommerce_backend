import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import { v2 as cloudinary } from 'cloudinary';
  import { CreatePageDto } from './dto/create-page.dto';
  import { UpdatePageDto } from './dto/update-page.dto';
  import { Page } from '../../models/page.schema';
  
  @Injectable()
  export class PagesService {
    constructor(@InjectModel(Page.name) private pageModel: Model<Page>) {}
  
    async getAllPages() {
      try {
        const pages = await this.pageModel
          .find({})
          .sort('-createdAt')
          .select('title cover.url createdAt updatedAt content slug status')
          .exec();
        return {
          message: 'Pages fetched successfully',
          data: pages,
        };
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
  
    async createPage(createPageDto: CreatePageDto, file: Express.Multer.File) {
      try {
        if (!createPageDto.title || !createPageDto.content) {
          throw new BadRequestException('Title and content are required');
        }
  
        let cover: { url: string; img_id: string } | undefined = undefined;
        if (file) {
          const fileStr = file.buffer.toString('base64');
          const fileType = file.mimetype;
          const dataUri = `data:${fileType};base64,${fileStr}`;
  
          const result = await cloudinary.uploader.upload(dataUri, {
            folder: 'pages',
            resource_type: 'auto',
            transformation: [{ width: 1000, crop: 'limit' }, { quality: 'auto' }],
          });
          cover = { url: result.secure_url, img_id: result.public_id };
        }
  
        const newPage = new this.pageModel({
          title: createPageDto.title,
          content: createPageDto.content,
          cover: cover,
          status: createPageDto.status,
        });
  
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
      file: Express.Multer.File,
    ) {
      try {
        const allowedFields = ['title', 'content', 'status'];
        const updateFields = Object.keys(updatePageDto);
  
        const invalidFields = updateFields.filter(
          (field) => !allowedFields.includes(field),
        );
  
        if (invalidFields.length > 0) {
          throw new BadRequestException(
            `Invalid fields provided: ${invalidFields.join(', ')}`,
          );
        }
  
        let cover: { url: string; img_id: string } | undefined = undefined;
        const page = await this.pageModel.findById(id);
  
        if (!page) {
          throw new NotFoundException('Page not found');
        }
  
        if (file) {
          if (page.cover && page.cover.img_id) {
            await cloudinary.uploader.destroy(page.cover.img_id);
          }
  
          const fileStr = file.buffer.toString('base64');
          const fileType = file.mimetype;
          const dataUri = `data:${fileType};base64,${fileStr}`;
  
          const result = await cloudinary.uploader.upload(dataUri, {
            folder: 'pages',
            resource_type: 'auto',
            transformation: [{ width: 1000, crop: 'limit' }, { quality: 'auto' }],
          });
          cover = { url: result.secure_url, img_id: result.public_id };
        }
  
        const updatedPage = await this.pageModel.findByIdAndUpdate(
          id,
          {
            ...updatePageDto,
            ...(typeof cover === 'object' && cover !== null ? { cover } : {}),
          },
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