import { Test, TestingModule } from '@nestjs/testing';
import { VentesService } from './vente.service';
import { VentesController } from './vente.controller';
import { getModelToken } from '@nestjs/mongoose';
import { ProductsService } from '../../routes/products/products.service';
import { InformationService } from '../../controllers/information/information.service';
import { Connection } from 'mongoose';

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
            findOne: jest.fn(),
          },
        },
        {
          provide: InformationService,
          useValue: {
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

describe('VentesController', () => {
  let controller: VentesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VentesController],
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
            findOne: jest.fn(),
          },
        },
        {
          provide: InformationService,
          useValue: {
            getAdvancedData: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<VentesController>(VentesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});