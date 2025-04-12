// src/shared/utils/generators/generators.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Information, InformationSchema } from '../../../../models/information.schema';

import { SlugService } from './reference-generator.service';

export const ReferenceGenerator = { provide: SlugService, useClass: SlugService };

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
