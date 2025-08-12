// C:\Users\LENOVO\Desktop\ecommerce-backend\src\models\category.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Model } from 'mongoose';
import { handleSlug } from '../shared/utils/generators/slug/slug-generator.service';

@Schema({ timestamps: true })
export class Category extends Document {
  @Prop()  // No constraints
  designation: string;

  @Prop()  // No constraints
  slug: string;

  @Prop()
  designation_fr?: string;

  @Prop()
  cover?: string;

  @Prop()
  cover_liste_produits?: string;

  @Prop()
  alt_cover?: string;

  @Prop()
  description_fr?: string;

  @Prop()
  description_cover?: string;

  @Prop()
  meta?: string;

  @Prop()
  content_seo?: string;

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

  @Prop()
  zone1?: string;

  @Prop()
  zone2?: string;

  @Prop()
  zone3?: string;

  @Prop()
  schema_description?: string;

  @Prop({
    type: {
      url: { type: String, required: false },  
      img_id: { type: String, required: false }  
    },
    _id: false,
    required: false
  })
  image?: {
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