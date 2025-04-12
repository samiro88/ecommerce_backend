import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Model } from 'mongoose'; // Ensure Model is imported
import { handleSlug } from '../shared/utils/generators/slug/slug-generator.service';

@Schema({ timestamps: true })
export class Pack extends Document {
  @Prop({ required: true })
  designation: string;

  @Prop({ unique: true })
  slug: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  smallDescription: string;

  @Prop()
  description: string;

  @Prop()
  question: string;

  @Prop()
  oldPrice: number;

  @Prop({
    type: {
      url: String,
      img_id: String,
    },
  })
  mainImage: {
    url: string;
    img_id: string;
  };

  @Prop({ type: [{ url: String, img_id: String }] })
  images: Array<{
    url: string;
    img_id: string;
  }>;

  @Prop({ type: [String] })
  products: string[];

  @Prop({ default: true })
  status: boolean;

  @Prop({ type: [String] })
  features: string[];

  @Prop()
  venteflashDate: Date;

  @Prop({ default: true })
  inStock: boolean;

  @Prop()
  rate: number;

  @Prop({
    type: [{
      userId: { type: Types.ObjectId, ref: 'Client' },
      userName: String,
      rating: Number,
      comment: String,
      isAnonymous: Boolean,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    }],
  })
  reviews: Array<{
    userId: Types.ObjectId;
    userName: string;
    rating: number;
    comment: string;
    isAnonymous: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export const PackSchema = SchemaFactory.createForClass(Pack);

// Preserve pre-save hook
PackSchema.pre('save', async function(next) {
  try {
    // Explicitly cast this.constructor as a Model<Pack> to resolve the error
    this.slug = await handleSlug(this, 'designation', this.constructor as Model<Pack>);
    next();
  } catch (error) {
    next(error);
  }
});
