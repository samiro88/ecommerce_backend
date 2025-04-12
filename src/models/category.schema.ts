import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Model } from 'mongoose';
import { handleSlug } from '../shared/utils/generators/slug/slug-generator.service';
import { Product } from '../models/product.schema'; // Corrected path
import { SubCategory } from '../models/sub-category.schema'; // Corrected path

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
export type CategoryDocument = Category & Document; 
// Preserve pre-save hook
CategorySchema.pre('save', async function (next) {
  try {
    // TypeScript fix: Casting to Model<Category>
    this.slug = await handleSlug(this, 'designation', this.constructor as Model<Category>);
    next();
  } catch (error) {
    next(error);
  }
});
