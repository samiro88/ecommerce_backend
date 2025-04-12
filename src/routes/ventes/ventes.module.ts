import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VentesService } from '../../controllers/vente/vente.service'; // Correct path
import { VentesController } from './ventes.controller';
import { Vente, VenteSchema } from '../../models/vente.schema';
import { Client, ClientSchema } from '../../models/client.schema';
import { PromoCode, PromoCodeSchema } from '../../models/promo-code.schema';
import { Product, ProductSchema } from '../../models/product.schema';
import { Pack, PackSchema } from '../../models/pack.schema';
import { Information, InformationSchema } from '../../models/information.schema';
import { Commande, CommandeSchema } from '../../models/commande.schema'; // Import Commande schema
import { InformationModule } from '../../controllers/information/information.module'; // Import InformationModule
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [VentesModule, ProductsModule, // Add ProductsModule
    forwardRef(() => ProductsModule), // Use forwardRef for circular dependency
    MongooseModule.forFeature([
      { name: Vente.name, schema: VenteSchema },
      { name: Client.name, schema: ClientSchema },
      { name: PromoCode.name, schema: PromoCodeSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Pack.name, schema: PackSchema },
      { name: Information.name, schema: InformationSchema },
      { name: 'Commande', schema: CommandeSchema },
    ]),
    forwardRef(() => InformationModule),
  ],
  controllers: [VentesController],
  providers: [VentesService],
  exports: [VentesService], // Export VentesService
})
export class VentesModule {}