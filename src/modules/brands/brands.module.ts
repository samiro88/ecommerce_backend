// --- brands.module.ts ---
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Brand, BrandSchema } from '../../models/brands.schema';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { Aroma, AromaSchema } from '../../models/aromas.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Brand.name, schema: BrandSchema },
      { name: Aroma.name, schema: AromaSchema },
    ]),
  ],
  controllers: [BrandsController],
  providers: [BrandsService],
  exports: [BrandsService],
})
export class BrandsModule {}