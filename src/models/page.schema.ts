import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose'; 
import { handleSlug } from '../shared/utils/generators/slug/slug-generator.service';

@Schema({ timestamps: true })
export class Page extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  slug: string;

  @Prop({
    type: {
      url: String,
      img_id: String,
    },
  })
  cover: {
    url: string;
    img_id: string;
  };

  @Prop()
  body: string;

  @Prop()
  excerpt: string;

  @Prop()
  meta_description: string;

  @Prop()
  meta_keywords: string;

  @Prop()
  author_id: string;

  @Prop()
  image: string;

  @Prop({ default: 'ACTIVE' })
  status: string;
}

export const PageSchema = SchemaFactory.createForClass(Page);

PageSchema.pre('save', async function(next) {
  try {
   
    this.slug = await handleSlug(this, 'title', this.constructor as Model<Page>);
    next();
  } catch (error) {
    next(error);
  }
});
