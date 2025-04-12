import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose'; // Ensure Model is imported
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
  content: string;

  @Prop({ default: true })
  status: boolean;
}

export const PageSchema = SchemaFactory.createForClass(Page);

// Preserve pre-save hook
PageSchema.pre('save', async function(next) {
  try {
    // Explicitly cast this.constructor as a Model<Page> to resolve the error
    this.slug = await handleSlug(this, 'title', this.constructor as Model<Page>);
    next();
  } catch (error) {
    next(error);
  }
});
