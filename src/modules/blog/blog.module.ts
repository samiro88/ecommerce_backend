import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { Blog, BlogSchema } from '../../models/blog.schema';
import { BlogConfig, BlogConfigSchema } from '../../models/blog-config.schema';
import { BlogConfigController } from '../../controllers/blog-config.controller';
import { CloudinaryModule as SharedCloudinaryModule } from '../../shared/utils/cloudinary/cloudinary/cloudinary.module';
import { CloudinaryModule as ControllerCloudinaryModule } from '../../controllers/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: BlogConfig.name, schema: BlogConfigSchema },
    ]),
    SharedCloudinaryModule,
    ControllerCloudinaryModule,
  ],
  controllers: [BlogController, BlogConfigController],
  providers: [BlogService],
  exports: [BlogService] 
})
export class BlogModule {}