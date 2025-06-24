import { 
  Injectable, 
  NotFoundException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog } from '../../models/blog.schema';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { CloudinaryService as ControllerCloudinaryService } from '../../controllers/cloudinary/cloudinary.service';
import { CloudinaryService as SharedCloudinaryService } from '../../shared/utils/cloudinary/cloudinary/cloudinary.service';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
    private readonly sharedCloudinaryService: SharedCloudinaryService,
    private readonly controllerCloudinaryService: ControllerCloudinaryService,
  ) {}

  async getAllBlogs() {
    console.log('getAllBlogs method called!');
    try {
      const blogs = await this.blogModel.find().sort({ createdAt: -1 }).lean().exec();
      // Debug: log the first blog to verify cover is present
      if (blogs.length > 0) {
        console.log('First blog:', blogs[0]);
      }
      return blogs;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch blogs');
    }
  }

  async createBlog(
    createBlogDto: CreateBlogDto, 
    file?: Express.Multer.File
  ) {
    try {
      const slug = createBlogDto.slug || 
        createBlogDto.title.toLowerCase()
          .replace(/ /g, '-')
          .replace(/[^\w-]+/g, '');

      let cover: { url: string; img_id: string } | string | undefined;
      
      if (file) {
        if (this.sharedCloudinaryService) {
          const result = await this.controllerCloudinaryService.uploadImage(file);
          cover = { url: result.secure_url, img_id: result.public_id };
        } else {
          cover = file.path; // Fallback to local storage
        }
      } else if (createBlogDto.cover) {
        cover = createBlogDto.cover;
      }

      const newBlog = new this.blogModel({
        ...createBlogDto,
        slug,
        cover,
        inLandingPage: createBlogDto.inLandingPage || false,
        showOnLandingPage: createBlogDto.showOnLandingPage || false
      });

      await newBlog.save();
      return newBlog.toObject(); // Always return plain object
    } catch (error) {
      throw new InternalServerErrorException('Failed to create blog');
    }
  }

  async updateBlog(
    id: string, 
    updateBlogDto: UpdateBlogDto, 
    file?: Express.Multer.File
  ) {
    try {
      const blog = await this.blogModel.findById(id);
      if (!blog) throw new NotFoundException('Blog not found');

      // Handle file upload/update
      let cover: { url: string; img_id: string; } | string | undefined = blog.cover;
      if (file) {
        if (blog.cover && typeof blog.cover !== 'string' && blog.cover.img_id) {
          await this.controllerCloudinaryService.deleteImage(blog.cover.img_id);
        }
        // Upload new image
        if (this.controllerCloudinaryService) {
          const result = await this.controllerCloudinaryService.uploadImage(file);
          cover = { url: result.secure_url, img_id: result.public_id };
        } else {
          cover = file.path; // Fallback to local storage
        }
      } else if (updateBlogDto.cover) {
        cover = updateBlogDto.cover;
      }

      // Handle slug update if title changed
      const slug = updateBlogDto.title 
        ? updateBlogDto.title.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '')
        : blog.slug;

      const updatedBlog = await this.blogModel.findByIdAndUpdate(
        id,
        { ...updateBlogDto, cover, slug },
        { new: true, runValidators: true }
      ).lean();

      return updatedBlog;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update blog');
    }
  }

  async deleteBlog(id: string) {
    try {
      const blog = await this.blogModel.findById(id);
      if (!blog) throw new NotFoundException('Blog not found');

      // Delete associated image
      if (blog.cover) {
        if (typeof blog.cover !== 'string' && blog.cover.img_id) {
          await this.controllerCloudinaryService.deleteImage(blog.cover.img_id);
        }
      }

      await this.blogModel.findByIdAndDelete(id);
      return { message: 'Blog deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete blog');
    }
  }

  async getLandingPageBlogs() {
    try {
      // Always include the full cover field, not just cover.url
      return await this.blogModel
        .find({ 
          $or: [
            { inLandingPage: true }, 
            { showOnLandingPage: true }
          ] 
        })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch landing page blogs');
    }
  }

  async getBlogById(id: string) {
    try {
      const blog = await this.blogModel.findById(id)
        .lean()
        .exec();
      if (!blog) throw new NotFoundException('Blog not found');
      return blog;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch blog');
    }
  }

  async getBlogBySlug(slug: string) {
    try {
      const blog = await this.blogModel.findOne({ slug })
        .lean()
        .exec();
      if (!blog) throw new NotFoundException('Blog not found');
      return blog;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch blog by slug');
    }
  }
}