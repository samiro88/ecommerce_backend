
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Model } from 'mongoose';
import { handleSlug } from '../shared/utils/generators/slug/slug-generator.service';

/**
 * Pack Schema - aligned with DB structure and extended 
 */
@Schema({ timestamps: true })
export class Pack extends Document {
  @Prop({ required: true })
  designation: string;

  @Prop({ unique: true })
  slug: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  oldPrice: number;

  @Prop()
  smallDescription: string;

  @Prop()
  description: string;

  @Prop()
  question: string;

  @Prop({
    type: {
      url: String,
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

  @Prop({ type: [String] })
  products: string[];

  @Prop({ default: true })
  status: boolean;

  @Prop({ type: [String] })
  features: string[];

  @Prop()
  venteflashDate: Date;

  @Prop({ default: true })
  inStock: boolean;

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
    userId: Types.ObjectId;
    userName: string;
    rating: number;
    comment: string;
    isAnonymous: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;

  // --- Additional fields from DB structure ---
  @Prop()
  meta_description_fr: string;

  @Prop()
  promo_expiration_date: Date;

  @Prop()
  aggregateRating: string; // Consider parsing to object if needed

  @Prop()
  nutrition_values: string;

  @Prop()
  questions: string;

  @Prop()
  zone1: string;

  @Prop()
  zone2: string;

  @Prop()
  zone3: string;

  @Prop()
  zone4: string;

  @Prop()
  alt_cover: string;

  @Prop()
  description_cover: string;

  @Prop()
  content_seo: string;

  @Prop()
  note: string;

  @Prop()
  best_seller: string;

  @Prop()
  new_product: string;

  @Prop()
  gallery: string;

  @Prop()
  cover: string;

  // --- Legacy/optional fields for future-proofing ---
  @Prop()
  sous_categorie_id: string;


  @Prop()
  code_product: string;

  @Prop()
  brand_id: string;

  @Prop()
  publier: string;

  @Prop()
  created_by: string;

  @Prop()
  updated_by: string;
}

export const PackSchema = SchemaFactory.createForClass(Pack);

// Slug generation middleware
PackSchema.pre('save', async function (next) {
  try {
    this.slug = await handleSlug(this, 'designation', this.constructor as Model<Pack>);
    next();
  } catch (error) {
    next(error);
  }
});
