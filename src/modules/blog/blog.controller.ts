import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  UseInterceptors, 
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BlogService } from './blog.service';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { CloudinaryService } from '../../shared/utils/cloudinary/cloudinary/cloudinary.service';
import { multerOptions } from '../../routes/blog/config/multer.config';

@Controller('blogs')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  @Get()
  async getAllBlogs() {
    console.log('getAllBlogs endpoint called!');
    try {
      return await this.blogService.getAllBlogs();
    } catch (error) {
      console.error('Error getting all blogs:', error);
      return { error: 'Failed to get all blogs' };
    }
  }

  @Get('get/all') 
  getAllBlogsNonAsync() {
    return this.blogService.getAllBlogs();
  }

  @Post()
  @UseInterceptors(FileInterceptor('cover', multerOptions))
  async createBlog(
    @Body() createBlogDto: CreateBlogDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
        fileIsRequired: false
      })
    ) file: Express.Multer.File
  ) {
    return await this.blogService.createBlog(createBlogDto, file);
  }

  @Post('new') 
  @UseInterceptors(FileInterceptor('cover', multerOptions))
  createBlogNonAsync(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
        fileIsRequired: false
      })
    ) cover: Express.Multer.File,
    @Body() blogData: CreateBlogDto
  ) {
    return this.blogService.createBlog(blogData, cover);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('cover', multerOptions))
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
        fileIsRequired: false
      })
    ) file: Express.Multer.File
  ) {
    return await this.blogService.updateBlog(id, updateBlogDto, file);
  }

  @Put('update/:id') 
  @UseInterceptors(FileInterceptor('cover', multerOptions))
  updateBlogNonAsync(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
        fileIsRequired: false
      })
    ) cover: Express.Multer.File,
    @Body() blogData: UpdateBlogDto
  ) {
    return this.blogService.updateBlog(id, blogData, cover);
  }

  @Delete(':id')
  async deleteBlog(@Param('id') id: string) {
    return await this.blogService.deleteBlog(id);
  }

  @Delete('delete/:id') 
  deleteBlogNonAsync(@Param('id') id: string) {
    return this.blogService.deleteBlog(id);
  }

  @Get('landing-page')
  async getLandingPageBlogs() {
    return await this.blogService.getLandingPageBlogs();
  }

  @Get('get-all-landing-page') 
  getLandingPageBlogsNonAsync() {
    return this.blogService.getLandingPageBlogs();
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string) {
    return await this.blogService.getBlogById(id);
  }

  @Get('get/:id') 
  getBlogByIdNonAsync(@Param('id') id: string) {
    return this.blogService.getBlogById(id);
  }

  @Get('slug/:slug') 
  async getBlogBySlug(@Param('slug') slug: string) {
    return await this.blogService.getBlogBySlug(slug);
  }

  //@Get('get/by-slug/:slug') 
  //getBlogBySlugNonAsync(@Param('slug') slug: string) {
   // return this.blogService.getBlogBySlug(slug);
 // }
}