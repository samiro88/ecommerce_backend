import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { Blog, BlogSchema } from './models/blog.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }])
  ],
  controllers: [BlogController],
  providers: [BlogService],
  exports: [BlogService] // If needed by other modules
})
export class BlogModule {}