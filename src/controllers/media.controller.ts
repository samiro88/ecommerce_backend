import { Controller, Get, Param, Query, Req, Res, Patch, Body, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { MediaService } from '../services/media.service';
import { RedisService } from 'nestjs-redis';
import { Request, Response } from 'express';

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly redisService: RedisService,
  ) {}

  @Get(':mediaId')
  async getMediaMetadata(
    @Param('mediaId') mediaId: string | null,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    if (!mediaId) {
      return res.status(400).json({ error: 'Media ID is required' });
    }

    const redisClient = this.redisService.getClient('default');
    const cachedMetadata = await redisClient.get(`media:${mediaId}:metadata`);
    if (cachedMetadata) {
      return res.json(JSON.parse(cachedMetadata));
    }

    try {
      const media = await this.mediaService.findById(mediaId);
      const metadata = {
        width: media.width,
        height: media.height,
        fileSize: media.fileSize,
      };
      await redisClient.set(`media:${mediaId}:metadata`, JSON.stringify(metadata), 'EX', 3600);
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
    const redisClient = this.redisService.getClient('default');
    const cacheKey = `media:page:${page}:limit:${limit}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

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

    await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 3600);

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

  // NEW: List media by folder
  @Get('/by-folder/:folderId')
  async getMediaByFolder(@Param('folderId') folderId: string, @Res() res: Response) {
    const mediaList = await this.mediaService.findByFolderId(folderId);
    return res.json(mediaList);
  }
}