import { Test, TestingModule } from '@nestjs/testing';
import { VentesService } from './vente.service';
import { getModelToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { InformationService } from '../../modules/information/information.service';
import { ProductsService } from '../products/product.service';
import { VentesModule } from './vente.module';
import { ProductsModule } from '../../modules/products/products.module';
import { ProductSchema } from '../../models/product.schema';

describe('VentesService', () => {
  let service: VentesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [VentesModule, ProductsModule], // Add ProductsModule
      providers: [
        VentesService,
        {
          provide: getModelToken('Vente'),
          useValue: {}, // Mock Vente model
        },
        {
          provide: getModelToken('Client'),
          useValue: {}, // Mock Client model
        },
        {
          provide: getModelToken('PromoCode'),
          useValue: {}, // Mock PromoCode model
        },
        {
          provide: getModelToken('Product'),
          useValue: ProductSchema, // Use the ProductSchema
        },
        {
          provide: getModelToken('Pack'),
          useValue: {}, // Mock Pack model
        },
        {
          provide: getModelToken('Information'),
          useValue: {}, // Mock Information model
        },
        {
          provide: getModelToken('Commande'),
          useValue: {}, // Mock Commande model
        },
        {
          provide: 'DatabaseConnection',
          useValue: {}, // Mock DatabaseConnection
        },
        {
          provide: InformationService,
          useValue: {
            getAdvancedData: jest.fn(),
          },
        },
        {
          provide: ProductsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VentesService>(VentesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});