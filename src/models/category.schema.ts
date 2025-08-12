// C:\Users\LENOVO\Desktop\ecommerce-backend\src\models\category.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Model } from 'mongoose';
import { handleSlug } from '../shared/utils/generators/slug/slug-generator.service';

@Schema({ timestamps: true })
export class Category extends Document {
  @Prop()
  designation?: string;

  @Prop()
  slug?: string;

  @Prop()
  designation_fr?: string;

  @Prop()
  cover?: string;

  @Prop()
  cover_liste_produits?: string;

  @Prop()
  product_liste_cover?: string;

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

  @Prop()
  created_by?: string;

  @Prop()
  updated_by?: string;

  @Prop()
  created_at?: string;

  @Prop()
  updated_at?: string;

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
  try {
    // Ensure designation exists
    if (!this.designation || this.designation.trim() === '') {
      this.designation = this.designation_fr || `category-${Date.now()}`;
    }
    
    // Generate slug from designation
    if (this.designation && (this.isModified('designation') || !this.slug)) {
      try {
        this.slug = await handleSlug(
          this as any, 
          'designation', 
          this.constructor as Model<any>
        );
      } catch (error) {
        // Fallback slug generation
        this.slug = this.designation.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') + `-${Date.now()}`;
      }
    }
    
    if (!this.slug) {
      this.slug = `category-${Date.now()}`;
    }
    
    next();
  } catch (error) {
    console.error('Pre-save hook error:', error);
    // Ensure we have basic required fields
    if (!this.designation) this.designation = `category-${Date.now()}`;
    if (!this.slug) this.slug = `category-${Date.now()}`;
    next();
  }
});

CategorySchema.index({ designation: 1, slug: 1 }, { sparse: true });