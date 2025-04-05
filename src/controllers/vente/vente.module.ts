import { Module } from '@nestjs/common';
import { VentesController } from './ventes.controller';
import { VentesService } from './ventes.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Vente, VenteSchema } from '../models/Ventes';
import { Client, ClientSchema } from '../models/Client';
import { PromoCode, PromoCodeSchema } from '../models/PromoCode';
import { Product, ProductSchema } from '../models/Product';
import { Pack, PackSchema } from '../models/Pack';
import { Information, InformationSchema } from '../models/Information';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vente.name, schema: VenteSchema },
      { name: Client.name, schema: ClientSchema },
      { name: PromoCode.name, schema: PromoCodeSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Pack.name, schema: PackSchema },
      { name: Information.name, schema: InformationSchema },
    ]),
  ],
  controllers: [VentesController],
  providers: [VentesService],
  exports: [VentesService],
})
export class VentesModule {}