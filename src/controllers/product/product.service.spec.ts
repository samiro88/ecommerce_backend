import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './product.service';
import { getModelToken } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import * as cloudinary from 'cloudinary'; // <-- ADD THIS IMPORT
import { ConfigService } from '@nestjs/config'; // <-- ADD THIS IMPORT
import { Product } from '../../models/product.schema';
import { ProductDocument } from '../../models/product.schema';
import { VentesService } from '../vente/vente.service';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) { // <-- ADD CONSTRUCTOR
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
      folder: 'default', // <-- DEFAULT FOLDER
      resource_type: 'auto'
    });
  }

  // ADD these new methods:
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
describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken('Product'),
          useValue: {}, // Mock Product model
        },
        {
          provide: getModelToken('Category'),
          useValue: {}, // Mock Category model
        },
        {
          provide: getModelToken('SubCategory'),
          useValue: {}, // Mock SubCategory model
        },
        {
          provide: VentesService,
          useValue: {}, // Mock VentesService
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
