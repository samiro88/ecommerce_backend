import { Test, TestingModule } from '@nestjs/testing';
import { PacksController } from './packs.controller';
import { PacksService } from './packs.service';

describe('PacksController', () => {
  let controller: PacksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PacksController],
      providers: [
        {
          provide: PacksService,
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

    controller = module.get<PacksController>(PacksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
