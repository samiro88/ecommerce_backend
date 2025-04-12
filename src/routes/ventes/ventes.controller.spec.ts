import { Test, TestingModule } from '@nestjs/testing';
import { VentesController } from './ventes.controller';
import { VentesService } from '../../controllers/vente/vente.service';

describe('VentesController', () => {
  let controller: VentesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VentesController],
      providers: [
        {
          provide: VentesService,
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

    controller = module.get<VentesController>(VentesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
