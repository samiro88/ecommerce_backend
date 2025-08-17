import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class BlogConfig extends Document {
  @Prop({ default: 'Blog & FAQ' })
  sectionTitle: string;

  @Prop({ default: 'Découvrez nos conseils d\'experts et trouvez les réponses à vos questions sur la nutrition sportive' })
  sectionDescription: string;

  @Prop({ default: 4 })
  maxDisplay: number;

  @Prop({ default: true })
  showOnFrontend: boolean;

  @Prop({ type: [String], default: [] })
  blogOrder: string[];
}

export const BlogConfigSchema = SchemaFactory.createForClass(BlogConfig);
export type BlogConfigDocument = BlogConfig & Document;