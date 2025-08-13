import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attachment } from '../models/attachment.schema';
import { Media, MediaDocument } from '../models/media.schema';
import { Response } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';
import { MediaCompressionService } from '../shared/utils/media-compression/media-compression.service';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectModel('Attachment') private readonly attachmentModel: Model<Attachment>,
    @InjectModel(Media.name) private readonly mediaModel: Model<MediaDocument>,
    private readonly mediaCompressionService: MediaCompressionService,
  ) {}

  async uploadFile(file: Express.Multer.File, folderId: string | undefined): Promise<Attachment> {
    const originalBuffer = file.buffer;
    let uploadBuffer = originalBuffer;
    let width: number | null = null;
    let height: number | null = null;

    // Detect file type and compress if image
    if (file.mimetype.startsWith('image/')) {
      uploadBuffer = await this.mediaCompressionService.compressImage(originalBuffer);
      try {
        const imageMetadata = await sharp(uploadBuffer).metadata();
        width = imageMetadata.width || null;
        height = imageMetadata.height || null;
      } catch (e) {
        width = null;
        height = null;
      }
    }

    // --- Save to /public/produits/{MonthYear}/ ---
    const now = new Date();
    const monthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' }).replace(' ', '');
    const publicDir = path.join(process.cwd(), 'public', 'produits', monthYear);
    await fs.mkdir(publicDir, { recursive: true });

    // Generate a unique filename
    const ext = path.extname(file.originalname) || '.webp';
    const baseName = path.basename(file.originalname, ext);
    const uniqueName = `${baseName}-${Date.now()}${ext}`;
    const filePath = path.join(publicDir, uniqueName);

    // Write file to disk
    await fs.writeFile(filePath, uploadBuffer);

    // Save relative URL for frontend (e.g. produits/April2024/filename.webp)
    const relativeUrl = path.join('produits', monthYear, uniqueName).replace(/\\/g, '/');

    // Save to media collection (optional)
    const media = new this.mediaModel({
      id: uniqueName,
      width: width,
      height: height,
      fileSize: uploadBuffer.length,
      folderId: folderId || null,
      url: relativeUrl,
    });
    await media.save();

    // Save to attachment collection
    const attachment = new this.attachmentModel({
      filename: file.originalname,
      mimetype: file.mimetype,
      size: uploadBuffer.length,
      url: relativeUrl,
    });

    return await attachment.save();
  }

  async getFile(filename: string, res: Response): Promise<void> {
    const file = await this.attachmentModel.findOne({ filename }).exec();
    if (!file) {
      res.status(404).send('File not found');
      return;
    }
    // Serve the file directly from public folder
    const filePath = path.join(process.cwd(), 'public', file.url);
    try {
      await fs.access(filePath);
      res.sendFile(filePath);
    } catch {
      res.status(404).send('File not found');
    }
  }
}
