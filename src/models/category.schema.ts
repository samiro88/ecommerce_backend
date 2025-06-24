// C:\Users\LENOVO\Desktop\ecommerce-backend\src\models\category.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Model } from 'mongoose';
import { handleSlug } from '../shared/utils/generators/slug/slug-generator.service';

@Schema({ timestamps: true })
export class Category extends Document {
  @Prop({ required: true, unique: true })  // Added unique constraint
  designation: string;

  @Prop({ unique: true })  // Added unique constraint
  slug: string;

  @Prop({
    type: {
      url: { type: String, required: true },  
      img_id: { type: String, required: true }  
    },
    _id: false  
  })
  image: {
    url: string;
    img_id: string;
  };

  @Prop({ 
    type: [{ 
      type: Types.ObjectId, 
      ref: 'Product',
      default: []  
    }] 
  })
  products: Types.ObjectId[];

  @Prop({ 
    type: [{ 
      type: Types.ObjectId, 
      ref: 'SubCategory',
      default: []  
    }] 
  })
  subCategories: Types.ObjectId[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);
export type CategoryDocument = Category & Document;

// Enhanced pre-save hook with validation
CategorySchema.pre('save', async function (next) {
  if (!this.isModified('designation')) return next();

  try {
    this.slug = await handleSlug(
      this, 
      'designation', 
      this.constructor as Model<Category>
    );
    next();
  } catch (error) {
    next(error instanceof Error ? error : new Error('Slug generation failed'));
  }
});

CategorySchema.index({ designation: 1, slug: 1 });