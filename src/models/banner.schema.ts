import { Schema, Document } from 'mongoose';

export class Banner extends Document {
  declare _id: string; // <-- Explicitly declare _id as string
  declare id: string;
  declare sous_categorie_id: string;
  declare designation_fr: string;
  declare cover: string;
  declare qte: string;
  declare prix_ht: string | null;
  declare prix: string;
  declare promo_ht: string | null;
  declare promo: string;
  declare description_fr: string;
  declare publier: string;
  declare created_by: string | null;
  declare updated_by: string | null;
  declare created_at: string;
  declare updated_at: string;
  declare code_product: string;
  declare slug: string;
  declare pack: string;
  declare brand_id: string | null;
  declare new_product: string;
  declare best_seller: string;
  declare gallery: string;
  declare note: string;
  declare meta_description_fr: string;
  declare promo_expiration_date: string | null;
  declare rupture: string;
  declare alt_cover: string | null;
  declare description_cover: string | null;
  declare meta: string;
  declare content_seo: string | null;
  declare review: string | null;
  declare aggregateRating: string | null;
  declare nutrition_values: string;
  declare questions: string;
  declare zone1: string;
  declare zone2: string;
  declare zone3: string;
  declare zone4: string;
  declare aroma_ids: string[] | null;

  // Banner-specific fields
  declare title: string;
  declare imageUrl: string;
  declare linkUrl: string;
  declare isActive: boolean;
  declare createdAt?: string;
  declare updatedAt?: string;
}

export const BannerSchema = new Schema<Banner>({
  _id: { type: String, required: true }, // <-- Explicitly set _id as string
  id: { type: String, required: true },
  sous_categorie_id: { type: String, required: true },
  designation_fr: { type: String, required: true },
  cover: { type: String, required: true },
  qte: { type: String, required: true },
  prix_ht: { type: String, default: null },
  prix: { type: String, required: true },
  promo_ht: { type: String, default: null },
  promo: { type: String, required: true },
  description_fr: { type: String, required: true },
  publier: { type: String, required: true },
  created_by: { type: String, default: null },
  updated_by: { type: String, default: null },
  created_at: { type: String, required: true },
  updated_at: { type: String, required: true },
  code_product: { type: String, required: true },
  slug: { type: String, required: true },
  pack: { type: String, required: true },
  brand_id: { type: String, default: null },
  new_product: { type: String, required: true },
  best_seller: { type: String, required: true },
  gallery: { type: String, required: true },
  note: { type: String, required: true },
  meta_description_fr: { type: String, required: true },
  promo_expiration_date: { type: String, default: null },
  rupture: { type: String, required: true },
  alt_cover: { type: String, default: null },
  description_cover: { type: String, default: null },
  meta: { type: String, required: true },
  content_seo: { type: String, default: null },
  review: { type: String, default: null },
  aggregateRating: { type: String, default: null },
  nutrition_values: { type: String, required: true },
  questions: { type: String, required: true },
  zone1: { type: String, required: true },
  zone2: { type: String, required: true },
  zone3: { type: String, required: true },
  zone4: { type: String, required: true },
  aroma_ids: { type: [String], default: null },

  // Banner-specific fields
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  linkUrl: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
});