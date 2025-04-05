import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    BadRequestException,
  } from '@nestjs/common';
  import { validate } from 'class-validator';
  import { plainToClass } from 'class-transformer';
  
  @Injectable()
  export class ValidationPipe implements PipeTransform<any> {
    constructor(private readonly schema: any) {}
  
    async transform(value: any, metadata: ArgumentMetadata) {
      const object = plainToClass(this.schema, value);
      const errors = await validate(object);
  
      if (errors.length > 0) {
        throw new BadRequestException('Validation failed');
      }
      return value;
    }
  }