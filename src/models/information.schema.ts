import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Information extends Document {
  @Prop({
    type: {
      logo: {
        url: String,
        img_id: String,
      },
      contact: {
        phone: String,
        fax: String,
        email: String,
        address: String,
      },
      social: {
        facebookUrl: String,
        twitterUrl: String,
        linkedInUrl: String,
        instagramUrl: String,
        pinterestUrl: String,
        youtubeUrl: String,
        whatsAppUrl: String,
      },
      playStoreUrl: String,
      appStoreUrl: String,
      appGalleryUrl: String,
    }
  })
  general: {
    logo: {
      url: string;
      img_id: string;
    };
    contact: {
      phone: string;
      fax: string;
      email: string;
      address: string;
    };
    social: {
      facebookUrl: string;
      twitterUrl: string;
      linkedInUrl: string;
      instagramUrl: string;
      pinterestUrl: string;
      youtubeUrl: string;
      whatsAppUrl: string;
    };
    playStoreUrl: string;
    appStoreUrl: string;
    appGalleryUrl: string;
  };

  @Prop({
    type: {
      images: {
        slides: [{ url: String, img_id: String }],
        materielImageSection: { url: String, img_id: String },
        brands: [{ url: String, img_id: String }],
      }
    }
  })
  homePage: {
    images: {
      slides: Array<{ url: string; img_id: string }>;
      materielImageSection: { url: string; img_id: string };
      brands: Array<{ url: string; img_id: string }>;
    };
  };

  @Prop({
    type: [{
      reviewer_name: String,
      review_content: String,
      rating: Number,
    }]
  })
  reviews: Array<{
    reviewer_name: string;
    review_content: string;
    rating: number;
  }>;

  @Prop({
    type: {
      matricule: String,
      rib: String,
      registerDeCommerce: String,
      livraison: Number,
      timber: Number,
      tva: Number,
      lastVenteRef: String,
    }
  })
  advanced: {
    matricule: string;
    rib: string;
    registerDeCommerce: string;
    livraison: number;
    timber: number;
    tva: number;
    lastVenteRef: string;
  };
}

export const InformationSchema = SchemaFactory.createForClass(Information);