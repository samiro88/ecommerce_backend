import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './falseanalytics.service';
import { getModelToken } from '@nestjs/mongoose';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getModelToken('Product'),
          useValue: {}, // Mock Product model
        },
        {
          provide: getModelToken('Category'),
          useValue: {}, // Mock Category model
        },
        {
          provide: getModelToken('PromoCode'),
          useValue: {}, // Mock PromoCode model
        },
        {
          provide: getModelToken('Vente'),
          useValue: {}, // Mock Vente model
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
