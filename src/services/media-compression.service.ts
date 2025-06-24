import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class MediaCompressionService {
  async compressImage(imageBuffer: Buffer): Promise<Buffer> {
    const compressedImage = await sharp(imageBuffer)
      .resize(800, 600)
      .jpeg({ quality: 80 })
      .toBuffer();
    return compressedImage;
  }
}