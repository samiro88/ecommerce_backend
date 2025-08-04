import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Slide, SlideSchema } from '../../models/slide.schema';
import { SlidesService } from './slides.service';
import { SlidesController } from './slides.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Slide.name, schema: SlideSchema }])],
  controllers: [SlidesController],
  providers: [SlidesService],
  exports: [SlidesService],
})
export class SlidesModule {}
