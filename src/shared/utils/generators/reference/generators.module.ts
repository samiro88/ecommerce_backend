// src/shared/utils/generators/generators.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Information, InformationSchema } from '../../information/schemas/information.schema';
import { ReferenceGenerator } from './reference-generator.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Information.name, schema: InformationSchema }
    ])
  ],
  providers: [ReferenceGenerator],
  exports: [ReferenceGenerator]
})
export class GeneratorsModule {}