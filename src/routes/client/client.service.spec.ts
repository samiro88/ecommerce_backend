import { Test, TestingModule } from '@nestjs/testing';
import { ClientService } from './client.service';
import { getModelToken } from '@nestjs/mongoose';

describe('ClientService', () => {
  let service: ClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        {
          provide: getModelToken('Client'),
          useValue: {}, // Mock Client model
        },
      ],
    }).compile();

    service = module.get<ClientService>(ClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
