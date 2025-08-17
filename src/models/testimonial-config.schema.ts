import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class TestimonialConfig extends Document {
  @Prop({ default: 'Avis de nos clients' })
  sectionTitle: string;

  @Prop({ default: 'Découvrez ce que pensent nos clients de PROTEINE TUNISIE. Plus de 15 ans d\'expérience au service de votre performance.' })
  sectionDescription: string;

  @Prop({ default: 6 })
  maxDisplay: number;

  @Prop({ default: true })
  showOnFrontend: boolean;

  @Prop({ type: [String], default: [] })
  testimonialOrder: string[];
}

export const TestimonialConfigSchema = SchemaFactory.createForClass(TestimonialConfig);
export type TestimonialConfigDocument = TestimonialConfig & Document;