// src/shared/utils/generators/slug/slug.module.ts
import { Module } from '@nestjs/common';
import { SlugGeneratorService } from './slug-generator.service'; 

@Module({
  providers: [SlugGeneratorService],
  exports: [SlugGeneratorService]
})
export class SlugModule {}