import { Test, TestingModule } from '@nestjs/testing';
import { VentesController } from './ventes.controller';

describe('VentesController', () => {
  let controller: VentesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VentesController],
    }).compile();

    controller = module.get<VentesController>(VentesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
