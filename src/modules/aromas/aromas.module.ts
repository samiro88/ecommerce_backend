// --- aromas.module.ts ---
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Aroma, AromaSchema } from '../../models/aromas.schema';
import { AromasService } from './aromas.service';
import { AromasController } from './aromas.controller';
import { Brand, BrandSchema } from '../../models/brands.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Aroma.name, schema: AromaSchema },
      { name: Brand.name, schema: BrandSchema },
    ]),
  ],
  controllers: [AromasController],
  providers: [AromasService],
  exports: [AromasService],
})
export class AromasModule {}