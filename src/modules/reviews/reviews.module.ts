import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from '../../models/reviews.schema';
import { TestimonialConfig, TestimonialConfigSchema } from '../../models/testimonial-config.schema';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TestimonialConfigController } from '../../controllers/testimonial-config.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: TestimonialConfig.name, schema: TestimonialConfigSchema },
    ]),
  ],
  controllers: [ReviewsController, TestimonialConfigController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}