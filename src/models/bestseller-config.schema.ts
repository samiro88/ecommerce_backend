import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class BestSellerConfig extends Document {
  @Prop({ default: 'Meilleures ventes' })
  sectionTitle: string;

  @Prop({ default: 'Découvrez nos meilleures ventes du moment sur une sélection de produits !' })
  sectionDescription: string;

  @Prop({ default: 4 })
  maxDisplay: number;

  @Prop({ default: true })
  showOnFrontend: boolean;

  @Prop({ type: [String], default: [] })
  productOrder: string[];
}

export const BestSellerConfigSchema = SchemaFactory.createForClass(BestSellerConfig);
export type BestSellerConfigDocument = BestSellerConfig & Document;