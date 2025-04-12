import { Test, TestingModule } from '@nestjs/testing';
import { SubCategoriesService } from './subcategories.service';
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
      ],
    }).compile();

    service = module.get<SubCategoriesService>(SubCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
