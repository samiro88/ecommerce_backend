import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs/promises';
import * as path from 'path';

@Controller('upload')
export class UploadController {
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
      
      console.log('File saved successfully:', {
        path: filePath,
        url: publicUrl
      });
      
      return {
        success: true,
        message: 'File uploaded successfully',
        url: publicUrl,
        filename: uniqueName,
        originalName: file.originalname,
        size: file.size
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw new HttpException(
        error.message || 'Upload failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}