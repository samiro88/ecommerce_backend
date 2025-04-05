import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog } from './schemas/blog.schema';
import { CreateBlogDto, UpdateBlogDto } from './dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getAllBlogs() {
    return await this.blogModel
      .find({})
      .sort('-createdAt')
      .select('title cover.url createdAt updatedAt content slug')
      .exec();
  }

  async createBlog(createBlogDto: CreateBlogDto, file: Express.Multer.File) {
    let cover = undefined;
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file);
      cover = { url: result.secure_url, img_id: result.public_id };
    }

    const newBlog = new this.blogModel({
      title: createBlogDto.title,
      content: createBlogDto.content,
      cover: cover,
      status: createBlogDto.status,
      inLandingPage: createBlogDto.inLandingPage,
    });

    await newBlog.save();
    return newBlog;
  }

  async deleteBlog(id: string) {
    const blog = await this.blogModel.findById(id);
    if (!blog) throw new Error('Blog not found');

    if (blog.cover && blog.cover.img_id) {
      await this.cloudinaryService.deleteImage(blog.cover.img_id);
    }

    await this.blogModel.findByIdAndDelete(id);
    return { message: 'Blog deleted successfully' };
  }

  async updateBlog(id: string, updateBlogDto: UpdateBlogDto, file: Express.Multer.File) {
    const blog = await this.blogModel.findById(id);
    if (!blog) throw new Error('Blog not found');

    let cover = blog.cover;
    if (file) {
      if (blog.cover && blog.cover.img_id) {
        await this.cloudinaryService.deleteImage(blog.cover.img_id);
      }

      const result = await this.cloudinaryService.uploadImage(file);
      cover = { url: result.secure_url, img_id: result.public_id };
    }

    const updatedBlog = await this.blogModel.findByIdAndUpdate(
      id,
      { ...updateBlogDto, cover },
      { new: true, runValidators: true },
    );
    return updatedBlog;
  }

  async getBlogById(id: string) {
    return await this.blogModel.findById(id).select('-_id -cover.img_id');
  }

  async getBlogBySlug(slug: string) {
    return await this.blogModel.findOne({ slug }).select('-_id -cover.img_id');
  }

  async getLandingPageBlogs() {
    return await this.blogModel
      .find({ inLandingPage: true })
      .sort({ createdAt: -1 })
      .select('title cover.url createdAt slug updatedAt -_id')
      .exec();
  }
}
