import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SystemMessage, SystemMessageSchema } from '../../models/system-message.schema';
import { SystemMessagesService } from './system-messages.service';
import { SystemMessagesController } from './system-messages.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: SystemMessage.name, schema: SystemMessageSchema }])],
  controllers: [SystemMessagesController],
  providers: [SystemMessagesService],
  exports: [SystemMessagesService],
})
export class SystemMessagesModule {}
