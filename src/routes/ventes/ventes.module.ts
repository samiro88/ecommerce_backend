import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VentesService } from '../../modules/ventes/vente.service'; // Correct path
import { VentesController } from './ventes.controller';
import { Vente, VenteSchema } from '../../models/vente.schema';
import { Client, ClientSchema } from '../../models/client.schema';
import { PromoCode, PromoCodeSchema } from '../../models/promo-code.schema';
import { Product, ProductSchema } from '../../models/product.schema';
import { Pack, PackSchema } from '../../models/pack.schema';
import { Information, InformationSchema } from '../../models/information.schema';
import { Commande, CommandeSchema } from '../../models/commande.schema'; // Import Commande schema
import { InformationModule } from '../../modules/information/information.module'; // Import InformationModule
import { ProductsModule } from '../../modules/products/products.module';

@Module({
  imports: [
    
    MongooseModule.forFeature([
      { name: Vente.name, schema: VenteSchema },
      { name: Client.name, schema: ClientSchema },
      { name: PromoCode.name, schema: PromoCodeSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Pack.name, schema: PackSchema },
      { name: Information.name, schema: InformationSchema },
      { name: 'Commande', schema: CommandeSchema },
    ]),
    forwardRef(() => InformationModule), // Use forwardRef for circular dependency
    forwardRef(() => ProductsModule), // Use forwardRef for circular dependency
  ],
  controllers: [VentesController],
  providers: [VentesService],
  exports: [VentesService],
})
export class VentesModule {}