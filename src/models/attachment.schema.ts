import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Blog } from './blog.schema';
@Schema({ timestamps: true })
export class Attachment extends Document {
  @Prop({ required: true })
  filename: string;

  @Prop()
  mimetype: string;

  @Prop()
  size: number;

  @Prop()
  url: string;

  @Prop({ ref: 'Blog' })
  blog: Blog;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);