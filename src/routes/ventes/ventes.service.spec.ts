import { Test, TestingModule } from '@nestjs/testing';
import { VentesService } from '../../modules/ventes/vente.service'; // Corrected import path
import { getModelToken } from '@nestjs/mongoose';
import { ProductsService } from '../../modules/products/product.service';
import { InformationService } from '../../modules/information/information.service';

describe('VentesService', () => {
  let service: VentesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
          provide: ProductsService,
          useValue: {
            // Mock ProductsService methods
            findOne: jest.fn(),
          },
        },
        {
          provide: InformationService,
          useValue: {
            // Mock InformationService methods
            getAdvancedData: jest.fn(),
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
