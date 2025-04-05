import { Module } from '@nestjs/common';
import { JoiValidationPipe } from './validation.pipe';

@Module({
  providers: [JoiValidationPipe],
  exports: [JoiValidationPipe],
})
export class ValidatorsModule {}