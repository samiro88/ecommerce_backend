import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeoPage, SeoPageSchema } from '../../models/seo-page.schema';
import { SeoPagesService } from './seo-pages.service';
import { SeoPagesController } from './seo-pages.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: SeoPage.name, schema: SeoPageSchema }])],
  controllers: [SeoPagesController],
  providers: [SeoPagesService],
  exports: [SeoPagesService],
})
export class SeoPagesModule {}
