import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiOptions, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }

  // Explicitly typed upload methods
  async uploadFile(filePath: string, options?: UploadApiOptions): Promise<UploadApiResponse> {
    return cloudinary.uploader.upload(filePath, options);
  }

  async uploadBuffer(buffer: Buffer, options?: UploadApiOptions): Promise<UploadApiResponse> {
    return cloudinary.uploader.upload(`data:application/octet-stream;base64,${buffer.toString('base64')}`, options);
  }

  async destroy(publicId: string, options?: any) {
    return cloudinary.uploader.destroy(publicId, options);
  }

  // Preserve direct access if needed
  get instance() {
    return cloudinary;
  }
}