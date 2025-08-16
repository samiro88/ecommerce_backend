import { Controller, Get, Param, Query, Req, Res, Patch, Body, Delete, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MediaService } from '../services/media.service';
import { FolderService } from '../services/folder.service';
import { Media, MediaDocument } from '../models/media.schema';
import { Request, Response } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly folderService: FolderService,
    @InjectModel('Media') private readonly mediaModel: Model<MediaDocument>,
  ) {}

  // NEW: List media by folder (MUST BE FIRST)
  @Get('/by-folder/*')
  async getMediaByFolder(@Req() req: Request, @Res() res: Response) {
    console.log('REQ.PARAMS:', req.params);
    const folderId = Array.isArray(req.params.path) ? req.params.path.join('/') : req.params.path;
    console.log('FOLDER ID in controller:', folderId);
    const mediaList = await this.mediaService.findByFolderId(folderId);
    return res.json(mediaList);
  }

  @Get(':mediaId')
  async getMediaMetadata(
    @Param('mediaId') mediaId: string | null,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    if (!mediaId) {
      return res.status(400).json({ error: 'Media ID is required' });
    }
    try {
      const media = await this.mediaService.findById(mediaId);
      const metadata = {
        width: media.width,
        height: media.height,
        fileSize: media.fileSize,
      };
      return res.json(metadata);
    } catch (err) {
      return res.status(404).json({ error: 'Media not found' });
    }
  }

  @Get()
  async getPaginatedMedia(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Res() res: Response,
  ): Promise<any> {
    const offset = (Number(page) - 1) * Number(limit);
    const [mediaList, totalCount] = await this.mediaService.findAllWithPagination(offset, Number(limit));

    const result = {
      data: mediaList.map(media => ({
        id: media.id,
        width: media.width,
        height: media.height,
        fileSize: media.fileSize,
      })),
      page: Number(page),
      limit: Number(limit),
      total: totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
    };

    return res.json(result);
  }

  // NEW: Update media (move, metadata)
  @Patch(':mediaId')
  async updateMedia(
    @Param('mediaId') mediaId: string,
    @Body() updateData: Partial<{ width: number; height: number; fileSize: number; folderId: string }>,
    @Res() res: Response,
  ) {
    try {
      const updated = await this.mediaService.updateMedia(mediaId, updateData);
      return res.json(updated);
    } catch (err) {
      return res.status(404).json({ error: err.message });
    }
  }

  // NEW: Delete media
  @Delete(':mediaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMedia(@Param('mediaId') mediaId: string) {
    await this.mediaService.deleteMedia(mediaId);
  }

  // NEW: Upload media to specific folder
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Body('folderId') folderId: string,
    @Res() res: Response,
  ) {
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const now = new Date();
    const monthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' }).replace(' ', '');
    const folderPath = folderId || `uploads/${monthYear}`;
    
    // Create folder structure
    const dashboardPublicDir = path.join(
      process.cwd(), '..', '..', 'sobitas-dashboard', 'dashboard-app', 'public', folderPath
    );
    await fs.mkdir(dashboardPublicDir, { recursive: true });
    
    // Generate unique filename
    const ext = path.extname(file.originalname) || '.jpg';
    const baseName = path.basename(file.originalname, ext);
    const uniqueName = `${baseName}-${Date.now()}${ext}`;
    const filePath = path.join(dashboardPublicDir, uniqueName);
    
    // Save file
    await fs.writeFile(filePath, file.buffer);
    
    const mediaId = `/${folderPath}/${uniqueName}`;
    
    // Create folders in database
    const folderParts = folderPath.split('/');
    let currentPath = '';
    let parentId: string | null = null;
    
    for (const part of folderParts) {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      try {
        await this.folderService.createFolder({
          id: currentPath,
          name: part,
          parentId
        });
      } catch (e) {
        // Folder already exists
      }
      parentId = currentPath;
    }
    
    // Save media to database
    const media = new this.mediaModel({
      id: mediaId,
      width: 800,
      height: 600,
      fileSize: file.size,
      folderId: folderPath
    });
    await media.save();
    
    return res.json({
      success: true,
      url: mediaId,
      media
    });
  }
}