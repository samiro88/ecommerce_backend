import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Invoice, InvoiceSchema } from '../../models/invoice.schema';
import { Product, ProductSchema } from '../../models/product.schema';
import { Commande, CommandeSchema } from '../../models/commande.schema';
import { Client, ClientSchema } from '../../models/client.schema';
import { InvoiceService } from '../../services/invoice.service';
import { InvoiceController } from '../../controllers/invoice.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Commande.name, schema: CommandeSchema },
      { name: Client.name, schema: ClientSchema },
    ]),
  ],
  providers: [InvoiceService],
  controllers: [InvoiceController],
  exports: [InvoiceService],
})
export class InvoiceModule {}