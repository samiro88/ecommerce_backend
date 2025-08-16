import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MediaDocument = Media & Document;

@Schema({ timestamps: false, collection: 'media' })
export class Media {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: false, default: 0 })
  width: number;

  @Prop({ required: false, default: 0 })
  height: number;

  @Prop({ required: false, default: 0 })
  fileSize: number;

  @Prop({ required: false })
folderId?: string; // ← relates to Folder.id
}

export const MediaSchema = SchemaFactory.createForClass(Media);