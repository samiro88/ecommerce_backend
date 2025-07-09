// src/modules/commande/commande.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Commande, CommandeSchema } from '../../models/commande.schema';
import { CommandeController } from './commande.controller';
import { CommandeService } from './commande.service';

//notification system for orders 

// Import notification dependencies
import { NotificationService } from '../../services/notification.service';
import { EmailService } from '../../services/email.service';
import { SmsService } from '../../services/sms.service';


@Module({
  imports: [MongooseModule.forFeature([{ name: Commande.name, schema: CommandeSchema }])],
  controllers: [CommandeController],
  providers: [CommandeService, NotificationService, EmailService, SmsService,],
  exports: [CommandeService],
})
export class CommandeModule {}