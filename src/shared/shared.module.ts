import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsService } from '../modules/products/product.service';
import { VentesService } from '../modules/ventes/vente.service';
import { Product, ProductSchema } from '../models/product.schema';
import { Vente, VenteSchema } from '../models/vente.schema';
import { Client, ClientSchema } from '../models/client.schema';
import { PromoCode, PromoCodeSchema } from '../models/promo-code.schema';
import { Pack, PackSchema } from '../models/pack.schema';
import { InformationModule } from '../modules/information/information.module';
import { Commande, CommandeSchema } from '../models/commande.schema';
import { Information, InformationSchema } from '../models/information.schema';
import { RedisService } from '../shared/utils/redis/redis.service'; /// <--- This import is not used in the module, consider removing it if not needed

@Module({
  imports: [
    InformationModule,
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Vente.name, schema: VenteSchema },
      { name: Client.name, schema: ClientSchema },
      { name: PromoCode.name, schema: PromoCodeSchema },
      { name: Pack.name, schema: PackSchema },
      { name: Information.name, schema: InformationSchema },
      { name: 'Commande', schema: CommandeSchema },
    ]),
  ],
  providers: [ProductsService, VentesService , RedisService],
  exports: [
    ProductsService,
    VentesService,
    InformationModule,
    MongooseModule,
    RedisService, // <--- Added RedisService to exports
  ],
})
export class SharedModule {}