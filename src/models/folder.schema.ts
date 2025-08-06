import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FolderDocument = Folder & Document;

@Schema({ timestamps: true, collection: 'folders' })
export class Folder {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, default: null })
  parentId: string | null;
}

export const FolderSchema = SchemaFactory.createForClass(Folder);
