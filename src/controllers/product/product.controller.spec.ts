import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './product.controller';
import { ProductsService } from './product.service';
import { ProductsModule } from '../product/product.module';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ProductsModule], // Add ProductsModule
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue({}),
            create: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
            remove: jest.fn().mockResolvedValue({}),
            // Add all methods used by the controller
            createProduct: jest.fn().mockResolvedValue({}),
            getProducts: jest.fn().mockResolvedValue([]),
            getAllProductsNormal: jest.fn().mockResolvedValue([]),
            getMaxPrice: jest.fn().mockResolvedValue(0),
            getProductsWithMilleurVente: jest.fn().mockResolvedValue([]),
            getProductsWithNewVente: jest.fn().mockResolvedValue([]),
            getProductsWithVenteFlashVente: jest.fn().mockResolvedValue([]),
            getProductsWithMaterielDeMusculation: jest.fn().mockResolvedValue([]),
            getProductById: jest.fn().mockResolvedValue({}),
            getProductBySlug: jest.fn().mockResolvedValue({}),
            updateProduct: jest.fn().mockResolvedValue({}),
            deleteProduct: jest.fn().mockResolvedValue({}),
            deleteManyProducts: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});