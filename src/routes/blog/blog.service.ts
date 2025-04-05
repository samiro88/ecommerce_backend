import { 
  Injectable, 
  NotFoundException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog } from '../models/blog.model';

@Injectable()
export class BlogService {
  constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>) {}

  async getAllBlogs() {
    try {
      return await this.blogModel.find().sort({ createdAt: -1 }).exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch blogs');
    }
  }

  async createBlog(cover: Express.Multer.File, blogData: CreateBlogDto) {
    try {
      const slug = blogData.slug || 
        blogData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      
      const newBlog = new this.blogModel({
        ...blogData,
        slug,
        cover: cover?.path
      });
      return await newBlog.save();
    } catch (error) {
      throw new InternalServerErrorException('Failed to create blog');
    }
  }

  async updateBlog(id: string, cover: Express.Multer.File, blogData: UpdateBlogDto) {
    try {
      const update = { ...blogData };
      if (cover) update.cover = cover.path;
      
      const updated = await this.blogModel
        .findByIdAndUpdate(id, update, { new: true })
        .exec();
        
      if (!updated) throw new NotFoundException('Blog not found');
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update blog');
    }
  }

  async deleteBlog(id: string) {
    try {
      const deleted = await this.blogModel.findByIdAndDelete(id).exec();
      if (!deleted) throw new NotFoundException('Blog not found');
      return { message: 'Blog deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete blog');
    }
  }

  async getLandingPageBlogs() {
    try {
      return await this.blogModel.find({ showOnLandingPage: true })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch landing page blogs');
    }
  }

  async getBlogById(id: string) {
    try {
      const blog = await this.blogModel.findById(id).exec();
      if (!blog) throw new NotFoundException('Blog not found');
      return blog;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch blog');
    }
  }

  async getBlogBySlug(slug: string) {
    try {
      const blog = await this.blogModel.findOne({ slug }).exec();
      if (!blog) throw new NotFoundException('Blog not found');
      return blog;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch blog by slug');
    }
  }
}