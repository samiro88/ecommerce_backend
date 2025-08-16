import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class NewArrivalConfig extends Document {
  @Prop({ default: 'Nouveautés' })
  sectionTitle: string;

  @Prop({ default: 'Découvrez nos nouveaux produits fraîchement arrivés !' })
  sectionDescription: string;

  @Prop({ default: 100 })
  maxDisplay: number;

  @Prop({ default: true })
  showOnFrontend: boolean;

  @Prop({ type: [String], default: [] })
  productOrder: string[];
}

export const NewArrivalConfigSchema = SchemaFactory.createForClass(NewArrivalConfig);
export type NewArrivalConfigDocument = NewArrivalConfig & Document;