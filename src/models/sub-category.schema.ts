  
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from './category.schema';
import { Product } from './product.schema';

@Schema()
export class SubCategory extends Document {
  @Prop({ required: true })
  designation: string;

  @Prop({ required: false })
  designation_fr?: string;

  @Prop({ required: false })
  name?: string;

  @Prop({ required: true, unique: true })
  slug: string;

  // For legacy support: string category id as in your DB
  @Prop({ required: false })
  categorie_id?: string;

  // For modern Mongoose population: ObjectId reference
  @Prop({ type: Types.ObjectId, ref: 'Category', required: false })
  category?: Types.ObjectId | Category;

  // For denormalized product references (array of ObjectIds)
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }], default: [] })
  products?: Types.ObjectId[] | Product[];

  // For image/cover fields
  @Prop()
  cover?: string;

  @Prop()
  alt_cover?: string;

  @Prop()
  description_cove?: string;

  // SEO/meta fields
  @Prop()
  meta?: string;

  @Prop()
  content_seo?: string;

  // Rich text/HTML fields
  @Prop()
  description_fr?: string;

  @Prop()
  review?: string;

  @Prop()
  aggregateRating?: string;

  @Prop()
  nutrition_values?: string;

  @Prop()
  questions?: string;

  @Prop()
  more_details?: string;

  // UI/zone fields
  @Prop()
  zone1?: string;

  @Prop()
  zone2?: string;

  @Prop()
  zone3?: string;

  @Prop()
  zone4?: string;

  // Timestamps
  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);
export type SubCategoryDocument = SubCategory & Document;

// Indexes for performance
SubCategorySchema.index({ category: 1 });
SubCategorySchema.index({ categorie_id: 1 });
SubCategorySchema.index({ slug: 1 }, { unique: true });
