import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attachment } from '../models/attachment.schema';
import { Media, MediaDocument } from '../models/media.schema';
import { CloudinaryService } from '../shared/utils/cloudinary/cloudinary/cloudinary.service';
import { Response } from 'express';
import * as fs from 'fs/promises';
import sharp from 'sharp';
import { MediaCompressionService } from '../shared/utils/media-compression/media-compression.service';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectModel('Attachment') private readonly attachmentModel: Model<Attachment>,
    @InjectModel(Media.name) private readonly mediaModel: Model<MediaDocument>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly mediaCompressionService: MediaCompressionService,
  ) {}

  async uploadFile(file: Express.Multer.File, folderId: string | undefined): Promise<Attachment> {
    const originalBuffer = await fs.readFile(file.path);
    let uploadBuffer = originalBuffer;
    let resourceType: 'image' | 'video' | 'raw' = 'raw';
    let width: number | null = null;
    let height: number | null = null;

    // Detect file type
    if (file.mimetype.startsWith('image/')) {
      // Compress/process image
      uploadBuffer = await this.mediaCompressionService.compressImage(originalBuffer);
      resourceType = 'image';
      // Get image metadata
      try {
        const imageMetadata = await sharp(uploadBuffer).metadata();
        width = imageMetadata.width || null;
        height = imageMetadata.height || null;
      } catch (e) {
        width = null;
        height = null;
      }
    } else if (file.mimetype.startsWith('video/')) {
      resourceType = 'video';
      // Optionally, extract video metadata here
    } else {
      resourceType = 'raw';
    }

    // Upload to Cloudinary
    const cloudinaryResult = await this.cloudinaryService.uploadBuffer(uploadBuffer, {
      resource_type: resourceType,
    });

    // Save to media collection (add folderId)
    const media = new this.mediaModel({
      id: cloudinaryResult.public_id,
      width: width,
      height: height,
      fileSize: uploadBuffer.length,
      folderId: folderId || null, // ← Save folderId
    });
    await media.save();

    // Save to attachment collection
    const attachment = new this.attachmentModel({
      filename: file.originalname,
      mimetype: file.mimetype,
      size: uploadBuffer.length,
      url: cloudinaryResult.secure_url,
    });

    return await attachment.save();
  }

  async getFile(filename: string, res: Response): Promise<void> {
    const file = await this.attachmentModel.findOne({ filename }).exec();
    if (!file) {
      res.status(404).send('File not found');
      return;
    }

    res.redirect(file.url);
  }
}
