import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Newsletter, NewsletterSchema } from '../../models/newsletter.schema';
import { NewslettersService } from './newsletters.service';
import { NewslettersController } from './newsletters.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Newsletter.name, schema: NewsletterSchema }])],
  controllers: [NewslettersController],
  providers: [NewslettersService],
  exports: [NewslettersService],
})
export class NewslettersModule {}
