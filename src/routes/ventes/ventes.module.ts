import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VentesController } from './ventes.controller';
import { VentesService } from './ventes.service';
import { Vente, VenteSchema } from '../models/Ventes';
import { Client, ClientSchema } from '../models/Client';
import { Product, ProductSchema } from '../models/Product';
import { PromoCode, PromoCodeSchema } from '../models/PromoCode';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vente.name, schema: VenteSchema },
      { name: Client.name, schema: ClientSchema },
      { name: Product.name, schema: ProductSchema },
      { name: PromoCode.name, schema: PromoCodeSchema },
    ]),
  ],
  controllers: [VentesController],
  providers: [VentesService],
  exports: [VentesService],
})
export class VentesModule {}