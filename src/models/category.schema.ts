import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { handleSlug } from '../utils/slugGenerator';
import { Product } from './product.schema'; // Ensure this exists
import { SubCategory } from './sub-category.schema'; // Ensure this exists

@Schema({ timestamps: true })
export class Category extends Document {
  @Prop({ required: true })
  designation: string;

  @Prop()
  slug: string;

  @Prop({
    type: {
      url: String,
      img_id: String,
    },
  })
  image: {
    url: string;
    img_id: string;
  };

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }] })
  products: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'SubCategory' }] })
  subCategories: Types.ObjectId[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Preserve pre-save hook
CategorySchema.pre('save', async function (next) {
  try {
    this.slug = await handleSlug(this, 'designation', this.constructor);
    next();
  } catch (error) {
    next(error);
  }
});