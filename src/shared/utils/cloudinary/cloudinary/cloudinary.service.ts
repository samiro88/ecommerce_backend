// src/shared/utils/cloudinary/cloudinary.service.ts
import { Injectable } from '@nestjs/common';
import * as cloudinary from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly cloudinary = cloudinary.v2;

  constructor() {
    // Preserved original configuration
    this.cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_SECRET_KEY
    });
  }

  // Original instance exposed with all methods
  getInstance() {
    return this.cloudinary;
  }

  // Common methods explicitly typed
  async upload(file: string | Buffer, options?: any) {
    return this.cloudinary.uploader.upload(file, options);
  }

  async destroy(publicId: string, options?: any) {
    return this.cloudinary.uploader.destroy(publicId, options);
  }
}