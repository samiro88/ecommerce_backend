import { Document } from 'mongoose';

export interface VenteFlash extends Document {
  id: string;
  designation_fr: string;
  cover: string;
  description: string;
  publier: string;
  slug: string;
  products: string[]; // Array of product IDs
}