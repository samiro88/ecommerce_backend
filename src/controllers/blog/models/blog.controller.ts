import { Controller, Get, Post, Delete, Put, Body, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { BlogService } from './blog.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateBlogDto, UpdateBlogDto } from './dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('blogs')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  async getAllBlogs() {
    return await this.blogService.getAllBlogs();
  }

  @Post()
  @UseInterceptors(FileInterceptor('cover'))
  async createBlog(@Body() createBlogDto: CreateBlogDto, @UploadedFile() file: Express.Multer.File) {
    return await this.blogService.createBlog(createBlogDto, file);
  }

  @Delete(':id')
  async deleteBlog(@Param('id') id: string) {
    return await this.blogService.deleteBlog(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('cover'))
  async updateBlog(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto, @UploadedFile() file: Express.Multer.File) {
    return await this.blogService.updateBlog(id, updateBlogDto, file);
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string) {
    return await this.blogService.getBlogById(id);
  }

  @Get('slug/:slug')
  async getBlogBySlug(@Param('slug') slug: string) {
    return await this.blogService.getBlogBySlug(slug);
  }

  @Get('landing-page')
  async getLandingPageBlogs() {
    return await this.blogService.getLandingPageBlogs();
  }
}
