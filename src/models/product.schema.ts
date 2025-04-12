import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Model } from 'mongoose'; // Import Model for typecasting
import { handleSlug } from '../shared/utils/generators/slug/slug-generator.service';
import { Category } from './category.schema';
import { SubCategory } from './sub-category.schema';  // Correct import path
import { Client } from './client.schema';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true })
  designation: string;

  @Prop({
    type: [{
      name: String,
      options: [{
        value: String,
        priceAdjustment: Number
      }]
    }]
  })
  variations: Array<{
    name: string;
    options: Array<{
      value: string;
      priceAdjustment: number;
      
    }>;
  }>;
  @Prop()
  codaBar: string;

  @Prop()
  slug: string;

  @Prop({ default: false })
  bestSellerSection: boolean;

  @Prop()
  smallDescription: string;

  @Prop()
  description: string;

  @Prop()
  question: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  oldPrice: number;

  @Prop({
    type: {
      url: { type: String, required: true },
      img_id: String,
    },
  })
  mainImage: {
    url: string;
    img_id: string;
  };

  @Prop({ type: [{ url: String, img_id: String }] })
  images: Array<{
    url: string;
    img_id: string;
  }>;

  @Prop()
  venteflashDate: Date;

  @Prop({ default: true })
  inStock: boolean;

  @Prop({ default: true })
  status: boolean;

  @Prop({ type: [String] })
  features: string[];

  @Prop({
    type: [{
      title: { type: String, required: true },
      inStock: { type: Boolean, default: true },
    }],
  })
  variant: Array<{
    title: string;
    inStock: boolean;
  }>;

  @Prop({
    type: [{
      title: { type: String, required: true },
      value: { type: String, required: true },
    }],
  })
  nutritionalValues: Array<{
    title: string;
    value: string;
  }>;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category: Category;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'SubCategory' }] })
  subCategory: SubCategory[];

  @Prop()
  brand: string;

  @Prop()
  rate: number;

  @Prop({
    type: [{
      userId: { type: Types.ObjectId, ref: 'Client' },
      userName: String,
      rating: Number,
      comment: String,
      isAnonymous: Boolean,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    }],
  })
  reviews: Array<{
    userId: Types.ObjectId | Client;
    userName: string;
    rating: number;
    comment: string;
    isAnonymous: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
export type ProductDocument = Product & Document;

// Preserve pre-save hook
ProductSchema.pre('save', async function(next) {
  try {
    // Explicitly cast this.constructor as a Model<Product> to resolve the error
    this.slug = await handleSlug(this, 'designation', this.constructor as Model<Product>);
    next();
  } catch (error) {
    next(error);
  }
});
