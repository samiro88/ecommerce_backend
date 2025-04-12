import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { CloudinaryService } from '../../../shared/utils/cloudinary/cloudinary/cloudinary.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from 'src/models/blog.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }])],
  providers: [BlogService, CloudinaryService],
  controllers: [BlogController],
})
export class BlogModule {}
