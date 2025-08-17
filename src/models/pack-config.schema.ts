import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PackConfig extends Document {
  @Prop({ default: 'Nos Packs Exclusifs' })
  sectionTitle: string;

  @Prop({ default: 'Profitez de nos packs exclusifs pour faire des économies sur vos achats !' })
  sectionDescription: string;

  @Prop({ default: 4 })
  maxDisplay: number;

  @Prop({ default: true })
  showOnFrontend: boolean;

  @Prop({ type: [String], default: [] })
  packOrder: string[];
}

export const PackConfigSchema = SchemaFactory.createForClass(PackConfig);
export type PackConfigDocument = PackConfig & Document;