import { Injectable } from '@nestjs/common';
import * as cloudinary from 'cloudinary'; 
import { ConfigService } from '@nestjs/config'; 

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) { 
    cloudinary.v2.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  // KEEP existing methods (if any)
  async uploadImage(file: Express.Multer.File) {
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    
    return cloudinary.v2.uploader.upload(dataURI, {
      folder: 'default', 
      resource_type: 'auto'
    });
  }

 
  async uploadToSpecificFolder(file: Express.Multer.File, folder: string) { // <-- NEW METHOD
    const result = await this.uploadImage(file);
    await cloudinary.v2.uploader.rename(
      result.public_id,
      `${folder}/${result.public_id.split('/').pop()}`
    );
    return {
      ...result,
      public_id: `${folder}/${result.public_id.split('/').pop()}`
    };
  }

  async deleteImage(publicId: string) { // <-- NEW METHOD
    return cloudinary.v2.uploader.destroy(publicId);
  }
}