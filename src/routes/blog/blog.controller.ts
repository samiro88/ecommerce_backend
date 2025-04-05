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
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { multerOptions } from '../../config/multer.config';

@Controller()
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get('get/all')
  getAllBlogs() {
    return this.blogService.getAllBlogs();
  }

  @Post('new')
  @UseInterceptors(FileInterceptor('cover', multerOptions))
  createBlog(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
        fileIsRequired: false // To match original behavior
      })
    ) cover: Express.Multer.File,
    @Body() blogData: CreateBlogDto
  ) {
    return this.blogService.createBlog(cover, blogData);
  }

  @Put('update/:id')
  @UseInterceptors(FileInterceptor('cover', multerOptions))
  updateBlog(
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
    return this.blogService.updateBlog(id, cover, blogData);
  }

  @Delete('delete/:id')
  deleteBlog(@Param('id') id: string) {
    return this.blogService.deleteBlog(id);
  }

  @Get('get-all-landing-page')
  getLandingPageBlogs() {
    return this.blogService.getLandingPageBlogs();
  }

  @Get('get/:id')
  getBlogById(@Param('id') id: string) {
    return this.blogService.getBlogById(id);
  }

  @Get('get/by-slug/:slug')
  getBlogBySlug(@Param('slug') slug: string) {
    return this.blogService.getBlogBySlug(slug);
  }
}