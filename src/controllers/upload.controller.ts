import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { Model, Document } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';

import * as fs from 'fs/promises';
import * as path from 'path';
const sharp = require('sharp');

@Controller('upload')
export class UploadController {
  constructor(
    @InjectModel('Media') private readonly mediaModel: Model<Document>,
  ) {}
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    try {
      console.log('=== UPLOAD CONTROLLER HIT ===');
      console.log('File received:', file ? {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      } : 'No file');

      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      // Create folder structure: /produits/MonthYear/
      const now = new Date();
      const monthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' }).replace(' ', '');
      
      // Save to dashboard public folder
      const dashboardPublicDir = path.join(
        process.cwd(), 
        '..', 
        '..', 
        'sobitas-dashboard', 
        'dashboard-app', 
        'public', 
        'produits', 
        monthYear
      );
      
      await fs.mkdir(dashboardPublicDir, { recursive: true });
      
      // Generate unique filename
      const ext = path.extname(file.originalname) || '.jpg';
      const baseName = path.basename(file.originalname, ext);
      const uniqueName = `${baseName}-${Date.now()}${ext}`;
      const filePath = path.join(dashboardPublicDir, uniqueName);
      
      // Save file
      await fs.writeFile(filePath, file.buffer);
      
      const publicUrl = `/produits/${monthYear}/${uniqueName}`;
      
      // Extract image metadata
      let width = 0, height = 0;
      try {
        if (file.mimetype.startsWith('image/') && sharp) {
          const metadata = await sharp(file.buffer).metadata();
          width = metadata.width || 0;
          height = metadata.height || 0;
        }
      } catch (err) {
        console.log('Could not extract image metadata, using defaults:', err.message);
        width = 800;
        height = 600;
      }
      
      // Save to database
      const mediaDoc = new this.mediaModel({
        id: publicUrl,
        width,
        height,
        fileSize: file.size,
        folderId: `produits/${monthYear}`
      });
      await mediaDoc.save();
      
      console.log('File saved successfully:', {
        path: filePath,
        url: publicUrl,
        width,
        height,
        fileSize: file.size
      });
      
      return {
        success: true,
        message: 'File uploaded successfully',
        url: publicUrl,
        filename: uniqueName,
        originalName: file.originalname,
        size: file.size,
        width,
        height
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw new HttpException(
        error.message || 'Upload failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('media')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Body('folderId') folderId?: string
  ) {
    try {
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      const now = new Date();
      const monthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' }).replace(' ', '');
      
      const dashboardPublicDir = path.join(
        process.cwd(), '..', '..', 'sobitas-dashboard', 'dashboard-app', 'public', 'produits', monthYear
      );
      
      await fs.mkdir(dashboardPublicDir, { recursive: true });
      
      const ext = path.extname(file.originalname) || '.jpg';
      const baseName = path.basename(file.originalname, ext);
      const uniqueName = `${baseName}-${Date.now()}${ext}`;
      const filePath = path.join(dashboardPublicDir, uniqueName);
      
      await fs.writeFile(filePath, file.buffer);
      
      const publicUrl = `/produits/${monthYear}/${uniqueName}`;
      
      let width = 0, height = 0;
      try {
        if (file.mimetype.startsWith('image/') && sharp) {
          const metadata = await sharp(file.buffer).metadata();
          width = metadata.width || 0;
          height = metadata.height || 0;
        }
      } catch (err) {
        width = 800;
        height = 600;
      }
      
      const mediaDoc = new this.mediaModel({
        id: publicUrl,
        width,
        height,
        fileSize: file.size,
        folderId: folderId || `produits/${monthYear}`
      });
      await mediaDoc.save();
      
      return {
        success: true,
        message: 'Media uploaded successfully',
        url: publicUrl,
        filename: uniqueName,
        originalName: file.originalname,
        size: file.size,
        width,
        height
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Media upload failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}