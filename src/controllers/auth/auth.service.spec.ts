import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { TokenService } from '../../shared/utils/tokens/token.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken('AdminUser'),
          useValue: {}, // Mock AdminUser model
        },
        {
          provide: getModelToken('Client'),
          useValue: {}, // Mock Client model
        },
        {
          provide: TokenService,
          useValue: {
            generateToken: jest.fn(),
            verifyToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
