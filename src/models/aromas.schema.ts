// --- aromas.schema.ts ---
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'aromas' })
export class Aroma extends Document {
  @Prop({ required: false })
  declare id: string;

  @Prop({ required: true })
  designation_fr: string;

  @Prop()
  created_at: string;

  @Prop()
  updated_at: string;

  @Prop({ type: Types.ObjectId, ref: 'Brand', required: false })
  brand: Types.ObjectId;
}

export const AromaSchema = SchemaFactory.createForClass(Aroma);