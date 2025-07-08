import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Model } from 'mongoose';
import { handleSlug } from '../shared/utils/generators/slug/slug-generator.service';
import { Category } from './category.schema';
import { SubCategory } from './sub-category.schema';
import { Client } from './client.schema';

@Schema({
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.designation = ret.designation_fr || ret.designation;
      ret.description = ret.description_fr || ret.description;
      ret.price = ret.prix || ret.price;
      ret.oldPrice = ret.promo || ret.oldPrice;
      ret.status = ret.publier === "1";
      ret.isNewArrival = ret.new_product === "1";
      ret.isBestSeller = ret.best_seller === "1";
      ret.isFeatured = ret.best_seller === "1"; 
      ret.smallDescription = ret.description_fr?.substring(0, 100) || '';
      ret.mainImage = { 
        url: ret.cover,
        img_id: '' 
      
      };
      
      delete ret.designation_fr;
      delete ret.description_fr;
      delete ret.prix;
      delete ret.promo;
      delete ret.publier;
      //delete ret.cover;
      delete ret.__v;
      delete ret.new_product;
      delete ret.best_seller;
      return ret;
    }
  }
})
export class Product extends Document {
  @Prop({ required: true, unique: true })
  @Prop() 
  designation: string;

  @Prop() 
  description: string;

  @Prop() // Mapped from prix
  price: number;

  @Prop() // Mapped from promo
  oldPrice: number;

  @Prop({ default: true }) // Mapped from publier === "1"
  status: boolean;

  @Prop()
  smallDescription: string;

  @Prop()
  designation_fr: string;

  @Prop()
  description_fr: string;

  @Prop()
  prix: number;

  @Prop()
  promo: number;

  @Prop({ default: "1" })
  publier: string;

  @Prop()
  cover: string;

  @Prop({ required: true })
  taxRate: number;

  @Prop()
  expiryDate: Date;

  @Prop()
  isDeal: string; 

  @Prop()
  slug: string;

  @Prop({ default: false })
  bestSellerSection: boolean;

  @Prop()
  question: string;

  @Prop()
  costPrice: number;

  @Prop({
    type: {
      url: { type: String },
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

  @Prop()
  sous_categorie_id: string;

  @Prop()
  qte: string;

  @Prop()
  code_product: string;

  @Prop({ default: "0" })
  new_product: string;

  @Prop({ default: "0" })
  best_seller: string;

  @Prop()
  gallery: string;

  @Prop()
  note: string;

  @Prop()
  meta_description_fr: string;

  @Prop()
  promo_expiration_date: Date;

  @Prop({ default: "0" })
  rupture: string;

  @Prop()
  alt_cover: string;

  @Prop()
  description_cover: string;

  @Prop()
  meta: string;

  @Prop()
  content_seo: string;

  @Prop()
  review: string;

  @Prop()
  aggregateRating: string;

  // Added fields
  @Prop({ default: "0" })
  isFeatured: string;  // Added field

  @Prop({ default: "0" })
  isNewArrival: string;  // Added field

@Prop({ type: Types.ObjectId, ref: 'AdminUser' })
createdBy: Types.ObjectId;

@Prop({ type: Types.ObjectId, ref: 'AdminUser' })
updatedBy: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
export type ProductDocument = Product & Document;
ProductSchema.pre<ProductDocument>('save', async function(next) {
  try {
    this.slug = await handleSlug(this, 'designation', this.constructor as unknown as Model<ProductDocument>);
    next();
  } catch (error) {
    next(error);
  }
});

ProductSchema.pre<ProductDocument>('save', async function(next) {
  try {
    if (this.expiryDate && this.expiryDate < new Date()) {
      throw new Error('Expiry date cannot be in the past');
    }
    next();
  } catch (error) {
    next(error);
  }
});
