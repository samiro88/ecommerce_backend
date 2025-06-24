// C:\Users\LENOVO\Desktop\ecommerce\ecommerce-backend\src\modules\dto\update-musculation-product.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateMusculationProductDto } from './create-musculation-product.dto';

export class UpdateMusculationProductDto extends PartialType(CreateMusculationProductDto) {}