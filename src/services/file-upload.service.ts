import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attachment } from '../models/attachment.schema';
import { CloudinaryService } from '../shared/utils/cloudinary/cloudinary/cloudinary.service';
import { Response } from 'express';
import * as fs from 'fs/promises'; // Add this
import { MediaCompressionService } from '../shared/utils/media-compression/media-compression.service'; // Add this

@Injectable()
export class FileUploadService {
  constructor(
    @InjectModel('Attachment') private readonly attachmentModel: Model<Attachment>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly mediaCompressionService: MediaCompressionService // Injected
  ) {}

  async uploadFile(file: Express.Multer.File): Promise<Attachment> {
    const originalBuffer = await fs.readFile(file.path);

    const compressedBuffer = await this.mediaCompressionService.compressImage(originalBuffer);

    const cloudinaryResult = await this.cloudinaryService.uploadBuffer(compressedBuffer, {
      resource_type: 'image',
    });

    const attachment = new this.attachmentModel();
    attachment.filename = file.originalname;
    attachment.mimetype = file.mimetype;
    attachment.size = compressedBuffer.length; // size after compression
    attachment.url = cloudinaryResult.secure_url;

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
