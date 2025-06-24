import { Test, TestingModule } from '@nestjs/testing';
import { PromoCodesController } from './promo-code.controller';
import { PromoCodesService } from './promo-code.service';

describe('PromoCodesController', () => {
  let controller: PromoCodesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromoCodesController],
      providers: [
        {
          provide: PromoCodesService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PromoCodesController>(PromoCodesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
