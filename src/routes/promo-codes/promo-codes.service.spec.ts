import { Test, TestingModule } from '@nestjs/testing';
import { PromoCodesService } from './promo-codes.service';
import { getModelToken } from '@nestjs/mongoose';

describe('PromoCodesService', () => {
  let service: PromoCodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromoCodesService,
        {
          provide: getModelToken('PromoCode'),
          useValue: {}, // Mock PromoCode model
        },
      ],
    }).compile();

    service = module.get<PromoCodesService>(PromoCodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
