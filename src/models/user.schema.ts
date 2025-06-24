import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'users' })
export class User extends Document {
  @Prop({ type: String })
  declare id: string;

  @Prop({ type: String })
  role_id: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String, unique: true })
  email: string;

  @Prop({ type: String })
  avatar: string;

  @Prop({ type: Date, default: null })
  email_verified_at: Date | null;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String })
  remember_token: string;

  @Prop({ type: String })
  settings: string;

  @Prop({ type: String })
  phone: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = User & Document;