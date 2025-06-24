import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './product.service';
import { getModelToken } from '@nestjs/mongoose';
import { VentesService } from '../ventes/vente.service';
import { ConfigService } from '@nestjs/config';
import * as cloudinary from 'cloudinary';
import { Product } from '../../models/product.schema';
import { Category } from '../../models/category.schema';
import { SubCategory } from '../../models/sub-category.schema';
import { CommandeVenteDto } from '../../modules/ventes/dto/commande-vente.dto';

// Mock CloudinaryService with all methods from both files
class MockCloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.v2.config({
      cloud_name: 'test-cloud',
      api_key: 'test-key',
      api_secret: 'test-secret',
    });
  }

  async uploadImage(file: Express.Multer.File) {
    return {
      public_id: 'mock-public-id',
      url: 'http://mock.url/image.jpg',
      secure_url: 'https://mock.url/image.jpg'
    };
  }

  async uploadToSpecificFolder(file: Express.Multer.File, folder: string) {
    return {
      public_id: `${folder}/mock-public-id`,
      url: `http://mock.url/${folder}/image.jpg`,
      secure_url: `https://mock.url/${folder}/image.jpg`
    };
  }

  async deleteImage(publicId: string) {
    return { result: 'ok' };
  }
}

describe('ProductsService', () => {
  let service: ProductsService;
  let ventesService: VentesService;
  let cloudinaryService: MockCloudinaryService;

  // Mock product data
  const mockProduct = {
    _id: '507f1f77bcf86cd799439011',
    designation: 'Test Product',
    price: 100,
    category: 'test-category',
    mainImage: {
      url: 'http://test.com/image.jpg',
      img_id: '123'
    }
  };

  const mockProductResponse = {
    message: 'success',
    data: mockProduct
  };

  const mockProductListResponse = {
    message: 'success',
    data: [mockProduct],
    pagination: {
      total: 1,
      page: 1,
      limit: 10
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: {
            new: jest.fn().mockResolvedValue(mockProduct),
            constructor: jest.fn().mockResolvedValue(mockProduct),
            find: jest.fn().mockResolvedValue([mockProduct]),
            findOne: jest.fn().mockResolvedValue(mockProduct),
            findById: jest.fn().mockResolvedValue(mockProduct),
            create: jest.fn().mockResolvedValue(mockProduct),
            updateOne: jest.fn(),
            deleteOne: jest.fn(),
            aggregate: jest.fn(),
            findByIdAndUpdate: jest.fn().mockResolvedValue(mockProduct),
            findByIdAndDelete: jest.fn().mockResolvedValue(mockProduct),
            countDocuments: jest.fn().mockResolvedValue(1),
          },
        },
        {
          provide: getModelToken(Category.name),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn().mockResolvedValue({ _id: 'category-id' }),
            findByIdAndUpdate: jest.fn(),
          },
        },
        {
          provide: getModelToken(SubCategory.name),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn().mockResolvedValue({ _id: 'subcategory-id' }),
            updateMany: jest.fn(),
          },
        },
        {
          provide: VentesService,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            addProductToVente: jest.fn().mockResolvedValue(true),
            removeProductFromVente: jest.fn(),
          },
        },
        {
          provide: 'CloudinaryService',
          useValue: new MockCloudinaryService(new ConfigService()),
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'CLOUDINARY_CLOUD_NAME': return 'test-cloud';
                case 'CLOUDINARY_API_KEY': return 'test-key';
                case 'CLOUDINARY_API_SECRET': return 'test-secret';
                default: return null;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    ventesService = module.get<VentesService>(VentesService);
    cloudinaryService = module.get('CloudinaryService');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(ventesService).toBeDefined();
    expect(cloudinaryService).toBeDefined();
  });

  describe('CRUD Operations', () => {
    it('should create a product', async () => {
      const createDto = { 
        designation: 'New Product', 
        price: 200,
        mainImage: {} as Express.Multer.File,
        files: []
      };
      
      const result = await service.createProduct(createDto, []);
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(expect.objectContaining({
        designation: 'Test Product',
        price: 100
      }));
    });

    it('should get all products', async () => {
      const result = await service.getProducts({});
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
      expect(result.data.products).toEqual(expect.arrayContaining([mockProduct]));
    });
  });

  describe('Extended Functionality', () => {
    it('should upload product image', async () => {
      const mockFile = {
        fieldname: 'image',
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test-image-data'),
      } as Express.Multer.File;
      
      const result = await cloudinaryService.uploadImage(mockFile);
      expect(result).toHaveProperty('public_id');
      expect(result).toHaveProperty('url');
    });

    describe('Extended Functionality', () => {
      it('should handle product with ventes', async () => {
        const commandeVenteDto: CommandeVenteDto = {
          items: [
            {
              type: 'Product',
              slug: 'product-slug',
              quantity: 1
            }
          ],
          client: {
            id: 'client-id',
            name: 'Client Name',
            email: 'client@example.com',
            phone1: '123456789',
            ville: 'City',
            address: 'Address'
          }
        };
    
        const result = await ventesService.createCommande(commandeVenteDto);
        expect(result).toBeDefined();
      });
    });

  describe('Error Handling', () => {
    it('should throw when product not found', async () => {
      jest.spyOn(service['productModel'], 'findById').mockResolvedValueOnce(null);
      await expect(service.getProductById('invalid-id')).rejects.toThrow('Product not found');
    });
  });
})});

