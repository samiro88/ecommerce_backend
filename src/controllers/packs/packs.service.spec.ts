import { Test, TestingModule } from '@nestjs/testing';
import { PacksService } from './packs.service';
import { getModelToken } from '@nestjs/mongoose';

describe('PacksService', () => {
  let service: PacksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PacksService,
        {
          provide: getModelToken('Pack'),
          useValue: {}, // Mock Pack model
        },
      ],
    }).compile();

    service = module.get<PacksService>(PacksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
