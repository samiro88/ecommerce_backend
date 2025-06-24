
import { Schema, Document } from 'mongoose';

// Define the type for a product in the cart
export interface CartProduct {
  title?: string;
  name?: string;
  product_name?: string;
  quantity?: number;
  price?: number;
  tva?: number;
  // Add other fields as needed
}

// Export a class for NestJS/Mongoose compatibility
export class Commande extends Document {
  declare id: string;
  user_id?: string;
  remise?: string;
  prix_ht: string;
  prix_ttc: string;
  tva?: string;
  timbre?: string;
  etat: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  nom: string;
  prenom: string;
  adresse1?: string;
  adresse2?: string;
  email: string;
  phone: string;
  pays: string;
  region?: string;
  ville?: string;
  code_postale?: string;
  note?: string;
  livraison?: string;
  frais_livraison?: string;
  livraison_nom?: string;
  livraison_no?: string;
  livraison_prenom?: string;
  livraison_adresse1?: string;
  livraison_adresse2?: string;
  livraison_email?: string;
  livraison_phone?: string;
  livraison_region?: string;
  livraison_ville?: string;
  livraison_code_postale?: string;
  numero: string;
  historique?: string;
  cart?: CartProduct[]; // <-- Added cart array for products
  // ...add any other fields you use
}

// Optionally, keep the interface for typing elsewhere
export interface CommandeDocument extends Commande {}

// The schema definition
export const CommandeSchema = new Schema<Commande>({
  //id: { type: String, required: true },
  user_id: { type: String },
  remise: { type: String },
  prix_ht: { type: String, required: true },
  prix_ttc: { type: String, required: true },
  tva: { type: String },
  timbre: { type: String },
  etat: { type: String, required: true },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String, required: true },
  updated_at: { type: String, required: true },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  adresse1: { type: String },
  adresse2: { type: String },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  pays: { type: String, required: true },
  region: { type: String },
  ville: { type: String },
  code_postale: { type: String },
  note: { type: String },
  livraison: { type: String },
  frais_livraison: { type: String },
  livraison_nom: { type: String },
  livraison_no: { type: String },
  livraison_prenom: { type: String },
  livraison_adresse1: { type: String },
  livraison_adresse2: { type: String },
  livraison_email: { type: String },
  livraison_phone: { type: String },
  livraison_region: { type: String },
  livraison_ville: { type: String },
  livraison_code_postale: { type: String },
  numero: { type: String, required: true },
  historique: { type: String },
  cart: [
    {
      title: { type: String },
      name: { type: String },
      product_name: { type: String },
      quantity: { type: Number },
      price: { type: Number },
      tva: { type: Number },
      // Add other fields as needed
    }
  ],
  // ...add any other fields you use
});
