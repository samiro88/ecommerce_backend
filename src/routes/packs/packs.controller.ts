
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