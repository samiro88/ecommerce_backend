import { Test, TestingModule } from '@nestjs/testing';
import { PacksService } from './packs.service';
import { getModelToken } from '@nestjs/mongoose';
import { CloudinaryService } from '../../shared/utils/cloudinary/cloudinary/cloudinary.service';

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
        {
          provide: CloudinaryService,
          useValue: {
            uploadImage: jest.fn(),
            deleteImage: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PacksService>(PacksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
