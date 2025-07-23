import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  html: string;

  @IsOptional()
  @IsArray()
  attachments?: {
    filename: string;
    path: string;
  }[];

  // Add these fields for order-shipped and other templates
  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  orderNumber?: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  orderItems?: any[];

  @IsOptional()
  @IsString()
  subtotal?: string;

  @IsOptional()
  @IsString()
  shippingCost?: string;

  @IsOptional()
  @IsString()
  shippingMethod?: string;

  @IsOptional()
  @IsString()
  total?: string;

  @IsOptional()
  @IsString()
  billingLocalite?: string;

  @IsOptional()
  @IsString()
  unsubscribeLink?: string;

  // Add fields for weekly-promotion if needed
  @IsOptional()
  @IsArray()
  promotions?: any[];

  @IsOptional()
  @IsString()
  promotionsLink?: string;
}
