import { Test, TestingModule } from '@nestjs/testing';
import { InformationService } from './information.service';
import { getModelToken } from '@nestjs/mongoose';

describe('InformationService', () => {
  let service: InformationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InformationService,
        {
          provide: getModelToken('Information'),
          useValue: {}, // Mock Information model
        },
      ],
    }).compile();

    service = module.get<InformationService>(InformationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
