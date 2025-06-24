import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MusculationProduct, MusculationProductSchema } from '../../models/MusculationProducts.schema';
import { MusculationProductService } from './MusculationProducts.service';
import { MusculationProductController } from './MusculationProducts.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MusculationProduct.name, schema: MusculationProductSchema },
    ]),
  ],
  controllers: [MusculationProductController],
  providers: [MusculationProductService],
  exports: [MusculationProductService],
})
export class MusculationProductModule {}