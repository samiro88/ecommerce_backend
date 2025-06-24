import { Test, TestingModule } from '@nestjs/testing';
import { SubCategoriesService } from './subcategory.service';
import { getModelToken } from '@nestjs/mongoose';

describe('SubCategoriesService', () => {
  let service: SubCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubCategoriesService,
        {
          provide: getModelToken('SubCategory'),
          useValue: {}, // Mock SubCategory model
        },
        {
          provide: getModelToken('Category'),
          useValue: {}, // Mock Category model
        },
        {
          provide: getModelToken('Product'),
          useValue: {}, // Mock Product model
        },
        {
          provide: 'DatabaseConnection',
          useValue: {}, // Mock DatabaseConnection
        },
      ],
    }).compile();

    service = module.get<SubCategoriesService>(SubCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
