import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ 
  timestamps: true, // 🟢 Automatically adds createdAt/updatedAt
  collection: 'adminusers' // 🟢 Optional: explicit collection name
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
  })
  password: string;

  @Prop({
    type: String,
    enum: ['admin', 'super-admin'],
    default: 'admin',
  })
  role: string;

  // 🟢 createdAt and updatedAt are automatically handled by @Schema(timestamps: true)
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);

// 🟢 Add indexes if needed (same as original)
AdminUserSchema.index({ userName: 1 }, { unique: true });