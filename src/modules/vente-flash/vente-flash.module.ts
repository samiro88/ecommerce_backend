import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VenteFlashController } from './vente-flash.controller';
import { VenteFlashService } from './vente-flash.service';
import { VenteFlashSchema } from '../../models/vente-flash.schema';
import { VenteFlashConfigController } from '../../controllers/vente-flash-config.controller';

// src/modules/vente-flash/vente-flash.module.ts
@Module({
    imports: [
      MongooseModule.forFeature([
        { name: 'VenteFlash', schema: VenteFlashSchema, collection: 'VenteFlash' }
      ]),
    ],
    controllers: [VenteFlashController, VenteFlashConfigController],
    providers: [VenteFlashService],
    exports: [VenteFlashService],
  })
  export class VenteFlashModule {}