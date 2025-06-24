// src/modules/commande/commande.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Commande, CommandeSchema } from '../../models/commande.schema';
import { CommandeController } from './commande.controller';
import { CommandeService } from './commande.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Commande.name, schema: CommandeSchema }])],
  controllers: [CommandeController],
  providers: [CommandeService],
  exports: [CommandeService],
})
export class CommandeModule {}