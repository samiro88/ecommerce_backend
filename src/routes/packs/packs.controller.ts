
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UploadedFiles,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PacksService } from './packs.service';

/**
 * Controller for managing Packs.
 * All business logic is delegated to the PacksService.
 * Consider replacing 'any' with DTOs for validation and type safety.
 */
@Controller('admin/packs')
export class PacksController {
  constructor(private readonly packsService: PacksService) {}
  

  /**
   * Admin create pack with file support - working endpoint
   */
  @Post('admin/new-with-file')
  @UseInterceptors(FilesInterceptor('files', 10))
  async adminCreatePackWithFile(
    @Body() packData: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      console.log('=== PACK ADMIN CREATE ENDPOINT HIT ===');
      console.log('Body received:', packData);
      console.log('Files received:', files ? files.length : 0);

      let imageUrl = '';
      
      // Upload file if provided
      if (files && files.length > 0) {
        const file = files[0]; // Use first file as main image
        const now = new Date();
        const monthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' }).replace(' ', '');
        
        const path = require('path');
        const dashboardPublicDir = path.join(
          process.cwd(), 
          '..', 
          '..', 
          'sobitas-dashboard', 
          'dashboard-app', 
          'public', 
          'packs', 
          monthYear
        );
        
        const fs = require('fs/promises');
        await fs.mkdir(dashboardPublicDir, { recursive: true });
        
        const ext = path.extname(file.originalname) || '.jpg';
        const baseName = path.basename(file.originalname, ext);
        const uniqueName = `${baseName}-${Date.now()}${ext}`;
        const filePath = path.join(dashboardPublicDir, uniqueName);
        
        await fs.writeFile(filePath, file.buffer);
        imageUrl = `/packs/${monthYear}/${uniqueName}`;
        
        console.log('File saved successfully:', {
          path: filePath,
          url: imageUrl
        });
      }
      
      // Create pack with form data and image URL
      const packPayload = {
        ...packData,
        cover: imageUrl || packData.cover || '',
        mainImage: imageUrl ? {
          url: imageUrl,
          img_id: `pack-${Date.now()}`
        } : undefined
      };
      
      // Use simplified creation logic
      const result = await this.packsService.createPackSimple(packPayload);
      console.log('Pack created successfully');
      
      return {
        success: true,
        message: 'Pack created successfully',
        imageUrl: imageUrl,
        data: result
      };
    } catch (error) {
      console.error('Pack creation error:', error);
      throw error;
    }
  }

  /**
   * Create a new pack.
   * Expects multipart/form-data with images and pack data.
   */
  @Post('new')
  @UseInterceptors(FilesInterceptor('images', 10))
  async createPack(
    @Body() body: any, // Replace 'any' with CreatePackDto for validation
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      return await this.packsService.createPack(body, files);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a paginated list of packs.
   * Supports query params for pagination, filtering, and sorting.
   */
  @Get('get')
  async getPackList(@Query() query: any) {
    try {
      return await this.packsService.getPackList(query);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get all packs (no pagination).
   */
  @Get('get/all')
  async getAllPacks() {
    try {
      return await this.packsService.getAllPacks();
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a pack by its MongoDB ID.
   */
  @Get('get/:id')
  async getPackById(@Param('id') id: string) {
    try {
      return await this.packsService.getPackById(id);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Admin delete pack - working endpoint
   */
  @Delete('admin/delete/:id')
  async adminDeletePack(@Param('id') id: string) {
    try {
      console.log('=== PACK ADMIN DELETE ENDPOINT HIT ===');
      console.log('Deleting pack ID:', id);
      
      const result = await this.packsService.deletePackSimple(id);
      console.log('Pack deleted successfully');
      
      return {
        success: true,
        message: 'Pack deleted successfully',
        data: result
      };
    } catch (error) {
      console.error('Pack deletion error:', error);
      throw new HttpException(
        error.message || 'Delete failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete a pack by ID.
   */
  @Delete('delete/:id')
  async deletePack(@Param('id') id: string) {
    try {
      return await this.packsService.deletePack(id);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Admin bulk delete packs - working endpoint
   */
  @Post('admin/delete/many')
  async adminDeletePacksInBulk(@Body() body: string[]) {
    try {
      console.log('=== PACK ADMIN BULK DELETE ENDPOINT HIT ===');
      console.log('Deleting pack IDs:', body);
      
      const result = await this.packsService.deletePacksSimple(body);
      console.log('Packs deleted successfully');
      
      return {
        success: true,
        message: 'Packs deleted successfully',
        data: result
      };
    } catch (error) {
      console.error('Pack bulk deletion error:', error);
      throw new HttpException(
        error.message || 'Bulk delete failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Bulk delete packs by IDs.
   * Expects an array of IDs in the request body.
   */
  @Post('delete/many')
  async deletePacksInBulk(@Body() body: string[]) {
    try {
      return await this.packsService.deletePacksInBulk(body);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Admin update pack with file support - working endpoint
   */
  @Put('admin/update-with-file/:id')
  @UseInterceptors(FilesInterceptor('files', 10))
  async adminUpdatePackWithFile(
    @Param('id') id: string,
    @Body() packData: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      console.log('=== PACK ADMIN UPDATE ENDPOINT HIT ===');
      console.log('ID:', id);
      console.log('Body received:', packData);
      console.log('Files received:', files ? files.length : 0);

      let imageUrl = '';
      
      // Upload file if provided
      if (files && files.length > 0) {
        const file = files[0]; // Use first file as main image
        const now = new Date();
        const monthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' }).replace(' ', '');
        
        const path = require('path');
        const dashboardPublicDir = path.join(
          process.cwd(), 
          '..', 
          '..', 
          'sobitas-dashboard', 
          'dashboard-app', 
          'public', 
          'packs', 
          monthYear
        );
        
        const fs = require('fs/promises');
        await fs.mkdir(dashboardPublicDir, { recursive: true });
        
        const ext = path.extname(file.originalname) || '.jpg';
        const baseName = path.basename(file.originalname, ext);
        const uniqueName = `${baseName}-${Date.now()}${ext}`;
        const filePath = path.join(dashboardPublicDir, uniqueName);
        
        await fs.writeFile(filePath, file.buffer);
        imageUrl = `/packs/${monthYear}/${uniqueName}`;
        
        console.log('File saved successfully:', {
          path: filePath,
          url: imageUrl
        });
      }
      
      // Update pack with form data and image URL
      const packPayload = {
        ...packData,
        cover: imageUrl || packData.cover || '',
        mainImage: imageUrl ? {
          url: imageUrl,
          img_id: `pack-${Date.now()}`
        } : undefined
      };
      
      const result = await this.packsService.updatePackSimple(id, packPayload);
      console.log('Pack updated successfully');
      
      return {
        success: true,
        message: 'Pack updated successfully',
        imageUrl: imageUrl,
        data: result
      };
    } catch (error) {
      console.error('Pack update error:', error);
      throw new HttpException(
        error.message || 'Update failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update a pack by ID.
   * Expects multipart/form-data with images and updated pack data.
   */
  @Put('update/:id')
  @UseInterceptors(FilesInterceptor('images', 10))
  async updatePack(
    @Param('id') id: string,
    @Body() body: any, // Replace 'any' with UpdatePackDto for validation
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      return await this.packsService.updatePack(id, body, files);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a pack by its slug.
   */
  @Get('get/store/packs/get-by-slug/:slug')
  async getPackBySlug(@Param('slug') slug: string) {
    try {
      return await this.packsService.getPackBySlug(slug);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get top promotion packs (packs with oldPrice > 0).
   */
  @Get('get/store/get/top-promotion-packs')
  async getPacksWithPromo() {
    try {
      return await this.packsService.getPacksWithPromo();
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Save pack section configuration
   */
  @Post('config/save')
  async savePackConfig(@Body() config: any) {
    try {
      console.log('=== SAVE PACK CONFIG ENDPOINT HIT ===');
      console.log('Config received:', config);
      
      const result = await this.packsService.savePackConfig(config);
      
      return {
        success: true,
        message: 'Configuration saved successfully',
        data: result
      };
    } catch (error) {
      console.error('Save config error:', error);
      throw new HttpException(
        error.message || 'Error saving config',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get frontend pack configuration and data
   */
  @Get('frontend/config')
  async getFrontendConfig(): Promise<any> {
    try {
      console.log('=== FRONTEND PACK CONFIG ENDPOINT HIT ===');
      
      // Get configuration and packs
      const configResult = await this.packsService.getPackConfig();
      const packsResult = await this.packsService.getRawPacks();
      const allPacks = packsResult.data;
      
      // Sort by displayOrder, then by createdAt
      const sortedPacks = allPacks.sort((a: any, b: any) => {
        if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
          return a.displayOrder - b.displayOrder;
        }
        if (a.createdAt && b.createdAt) {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return 0;
      });
      
      // Filter only published packs
      const publishedPacks = sortedPacks.filter((pack: any) => 
        pack.publier === "1" || pack.publier === 1 || pack.status === true
      );
      
      return {
        success: true,
        data: {
          packs: publishedPacks,
          config: configResult || {
            sectionTitle: 'Nos Packs Exclusifs',
            sectionDescription: 'Profitez de nos packs exclusifs pour faire des économies sur vos achats !',
            maxDisplay: 4,
            showOnFrontend: true
          }
        }
      };
    } catch (error) {
      console.error('Frontend config error:', error);
      throw new HttpException(
        error.message || 'Error fetching frontend config',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get all packs as raw documents (legacy and new fields).
   */
 @Get('raw')
async getRawPacks(): Promise<{ success: boolean; data: any[] }> {
  try {
    return await this.packsService.getRawPacks();
  } catch (error) {
    throw new HttpException(
      error.message,
      error.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
}