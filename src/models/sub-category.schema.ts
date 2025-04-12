import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from './category.schema';
import { Product } from './product.schema';

@Schema()
export class SubCategory extends Document {
  @Prop({ required: true })
  designation: string;

  @Prop({ required: true })
  name: string;
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category: Types.ObjectId | Category;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }] })
  products: Types.ObjectId[] | Product[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);
export type SubCategoryDocument = SubCategory & Document;

// Optional: Add index for better query performance
SubCategorySchema.index({ category: 1 });