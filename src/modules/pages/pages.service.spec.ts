import { Test, TestingModule } from '@nestjs/testing';
import { PagesService } from './pages.service';
import { getModelToken } from '@nestjs/mongoose';

describe('PagesService', () => {
  let service: PagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagesService,
        {
          provide: getModelToken('Page'),
          useValue: {}, // Mock Page model
        },
      ],
    }).compile();

    service = module.get<PagesService>(PagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
