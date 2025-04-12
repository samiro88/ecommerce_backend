// app.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
[{
	"resource": "/c:/Users/LENOVO/Desktop/ecommerce-backend/src/controllers/blog/models/blog.service.spec.ts",
	"owner": "typescript",
	"code": "2307",
	"severity": 8,
	"message": "Cannot find module '../../../shared/utils/cloudinary/cloudinary.service' or its corresponding type declarations.",
	"source": "ts",
	"startLineNumber": 4,
	"startColumn": 35,
	"endLineNumber": 4,
	"endColumn": 88
}]
import { getModelToken } from '@nestjs/mongoose';
import { MessagesController } from './app.controller';
import { MessagesService } from './routes/messages/messages.service';

describe('MessagesController', () => {
  let controller: MessagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        MessagesService,
        {
          provide: getModelToken('Message'),
          useValue: {}, // Mock Message model
        },
      ],
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
