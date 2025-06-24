// src/attachment/attachment.module.ts
import { Module } from '@nestjs/common';
import { AttachmentController } from '../controllers/attachement.controller';
import { AttachmentService } from '../controllers/attachment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Attachment, AttachmentSchema } from '../models/attachment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Attachment.name, schema: AttachmentSchema }]),
  ],
  controllers: [AttachmentController],
  providers: [AttachmentService],
})
export class AttachmentModule {}