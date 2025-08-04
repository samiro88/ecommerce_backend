import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Annonce, AnnonceSchema } from '../../models/annonce.schema';
import { AnnoncesService } from './annonces.service';
import { AnnoncesController } from './annonces.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Annonce.name, schema: AnnonceSchema }])],
  controllers: [AnnoncesController],
  providers: [AnnoncesService],
  exports: [AnnoncesService],
})
export class AnnoncesModule {}
