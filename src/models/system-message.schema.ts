import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SystemMessageDocument = SystemMessage & Document;

@Schema({ timestamps: false, collection: 'messages' })
export class SystemMessage {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop() msg_welcome: string;
  @Prop() msg_etat_commande: string;
  @Prop() msg_passez_commande: string;
  @Prop() created_at: string;
  @Prop() updated_at: string;
}

export const SystemMessageSchema = SchemaFactory.createForClass(SystemMessage);
