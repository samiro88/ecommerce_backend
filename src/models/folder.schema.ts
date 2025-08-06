// folder.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FolderDocument = Folder & Document;

@Schema({ timestamps: true, collection: 'folders' })
export class Folder {
  save(): Folder | PromiseLike<Folder> {
      throw new Error('Method not implemented.');
  }
  @Prop({ required: true, unique: true })
  id: string; // e.g., UUID or generated ID

  @Prop({ required: true })
  name: string; // e.g., "Uploads", "Products", etc.

  @Prop({ default: null })
  parentId: string | null; // for nested folders
}

export const FolderSchema = SchemaFactory.createForClass(Folder);
