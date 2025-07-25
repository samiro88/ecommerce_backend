import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FAQ, FAQSchema } from '../../models/faq.schema';
import { FaqsService } from './faqs.service';
import { FaqsController } from './faqs.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: FAQ.name, schema: FAQSchema }])],
  controllers: [FaqsController],
  providers: [FaqsService],
  exports: [FaqsService],
})
export class FaqsModule {}