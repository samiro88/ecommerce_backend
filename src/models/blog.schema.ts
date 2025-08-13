import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { handleSlug } from '../shared/utils/generators/slug/slug-generator.service';
import { model, Model } from 'mongoose';

@Schema({ timestamps: true })
export class Blog extends Document {

  @Prop({ required: false })
  title: string;

  @Prop({ required: false })
  designation_fr: string;

  @Prop()
  slug: string;

  @Prop({
    type: {
      url: String,
      img_id: String,
    },
  })
 cover: any;

  @Prop()
  content: string;

  @Prop()
  description: string;

  @Prop({ default: true })
  status: boolean;

  @Prop({ default: false })
  inLandingPage: boolean;

  @Prop()
  publier: string;

  @Prop()
  alt_cover: string;

  @Prop()
  description_cover: string;

  @Prop()
  meta: string;

  @Prop()
  content_seo: string;

  @Prop()
  review: string;

  @Prop()
  aggregateRating: string;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

// Preserve the pre-save hook
BlogSchema.pre('save', async function (next) {
  try {
    this.slug = await handleSlug(this, 'title', this.constructor as typeof Model);
    next();
  } catch (error) {
    next(error);
  }
});

// Handle model existence check (TypeScript version)
export const BlogModel = model('Blog', BlogSchema);