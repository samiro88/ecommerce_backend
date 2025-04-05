import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Category extends Document {
  @Prop({ required: true })
  designation: string;

  @Prop({
    type: {
      url: String,
      img_id: String,
    },
  })
  image: { url: string; img_id: string };

  @Prop({ type: [{ type: Types.ObjectId, ref: 'SubCategory' }] })
  subCategories: Types.ObjectId[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);
