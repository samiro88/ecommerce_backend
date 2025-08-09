import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ 
  timestamps: true,
  collection: 'adminusers'
})
export class AdminUser extends Document {
  @Prop({
    type: String,
    required: true,
    unique: true, 
  })
  userName: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  email: string;

  @Prop({
    type: String,
    required: true,
  })
  password: string;

  @Prop({
    type: String,
    enum: ['admin', 'super-admin'],
    default: 'admin',
  })
  role: string;
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);

export type AdminUserDocument = AdminUser & Document & {
  _id: Types.ObjectId;
};