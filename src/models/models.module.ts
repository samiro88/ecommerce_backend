import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUser, AdminUserSchema } from './admin-user.schema';
import { Blog, BlogSchema } from './blog.schema';
import { Category, CategorySchema } from './category.schema';
import { Client, ClientSchema } from './client.schema';
import { Information, InformationSchema } from './information.schema';
import { Message, MessageSchema } from './message.schema';
import { Pack, PackSchema } from './pack.schema';
import { Page, PageSchema } from './page.schema';
import { Product, ProductSchema } from './product.schema';
import { SubCategory, SubCategorySchema } from './sub-category.schema';
import { PromoCode, PromoCodeSchema } from './promo-code.schema';
import { Vente, VenteSchema } from './vente.schema'; // New addition

const schemaDefinitions = [
  { name: AdminUser.name, schema: AdminUserSchema },
  { name: Blog.name, schema: BlogSchema },
  { name: Category.name, schema: CategorySchema },
  { name: Client.name, schema: ClientSchema },
  { name: Information.name, schema: InformationSchema },
  { name: Message.name, schema: MessageSchema },
  { name: Pack.name, schema: PackSchema },
  { name: Page.name, schema: PageSchema },
  { name: Product.name, schema: ProductSchema },
  { name: SubCategory.name, schema: SubCategorySchema },
  { name: PromoCode.name, schema: PromoCodeSchema },
  { name: Vente.name, schema: VenteSchema } // New addition
];

@Module({
  imports: [MongooseModule.forFeature(schemaDefinitions)],
  exports: [MongooseModule],
})
export class ModelsModule {}