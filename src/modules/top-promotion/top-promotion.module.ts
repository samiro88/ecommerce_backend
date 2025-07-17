import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TopPromotion, TopPromotionSchema } from '../../models/top-promotion.schema';
import { TopPromotionService } from './top-promotion.service';
import { TopPromotionController } from './top-promotion.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TopPromotion.name, schema: TopPromotionSchema, collection: 'top_promotions' },
    ]),
  ],
  controllers: [TopPromotionController],
  providers: [TopPromotionService],
  exports: [TopPromotionService],
})
export class TopPromotionModule {}