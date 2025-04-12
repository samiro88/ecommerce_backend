import { Test, TestingModule } from '@nestjs/testing';
import { VentesService } from './vente.service';
import { getModelToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { InformationService } from '../information/information.service';
import { ProductsService } from '../product/product.service';
import { VentesModule } from '../vente/vente.module';
import { ProductsModule } from '../product/product.module';

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
          useValue: {}, // Mock Product model
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