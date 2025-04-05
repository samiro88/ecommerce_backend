import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import * as Joi from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private readonly schema: Joi.ObjectSchema) {}

  transform(value: any) {
    const { error } = this.schema.validate(value, { 
      abortEarly: false,
      allowUnknown: false 
    });

    if (error) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation failed',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message.replace(/['"]+/g, '') // Removes Joi's quotes
        }))
      });
    }

    return value;
  }
}