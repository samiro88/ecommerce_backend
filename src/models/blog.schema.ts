import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { handleSlug } from '../shared/utils/generators/slug/slug-generator.service';
import { Model } from 'mongoose';

@Schema({ timestamps: true })
export class Blog extends Document {

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
  content: string;

  @Prop({ default: true })
  status: boolean;

  @Prop({ default: false })
  inLandingPage: boolean;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

// 🟢 Preserve the pre-save hook
BlogSchema.pre('save', async function (next) {
  try {
    this.slug = await handleSlug(this, 'title', this.constructor as Model<Blog>);
    next();
  } catch (error) {
    next(error);
  }
});

// 🟢 Handle model existence check (TypeScript version)
export const BlogModel = BlogSchema;
