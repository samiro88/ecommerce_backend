import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../routes/auth/auth.controller';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { TokenService } from '../../shared/utils/tokens/token.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
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

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
