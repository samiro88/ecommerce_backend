import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from './blog.service';
import { getModelToken } from '@nestjs/mongoose';

describe('BlogService', () => {
  let service: BlogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        {
          provide: getModelToken('Blog'),
          useValue: {}, // Mock Blog model
        },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
