import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class MediaCompressionService {
  async compressImage(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(1080) // resize width to 1080px (auto height)
      .jpeg({ quality: 80 }) // compress to JPEG with 80% quality
      .toBuffer();
  }
}
