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

  @Post('admin/new-with-file')
  @UseInterceptors(FileInterceptor('file'))
  async adminCreateBlogWithFile(
    @Body() blogData: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      console.log('=== BLOG WITH FILE ENDPOINT HIT ===');
      console.log('Body received:', blogData);
      console.log('File received:', file ? {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      } : 'No file');

      let imageUrl = '';
      
      // Upload file if provided
      if (file) {
        const now = new Date();
        const monthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' }).replace(' ', '');
        
        const path = require('path');
        const dashboardPublicDir = path.join(
          process.cwd(), 
          '..', 
          '..', 
          'sobitas-dashboard', 
          'dashboard-app', 
          'public', 
          'blogs', 
          monthYear
        );
        
        const fs = require('fs/promises');
        await fs.mkdir(dashboardPublicDir, { recursive: true });
        
        const ext = path.extname(file.originalname) || '.jpg';
        const baseName = path.basename(file.originalname, ext);
        const uniqueName = `${baseName}-${Date.now()}${ext}`;
        const filePath = path.join(dashboardPublicDir, uniqueName);
        
        await fs.writeFile(filePath, file.buffer);
        const baseUrl = process.env.BACKEND_API_URL || 'https://api.protein.tn';
        imageUrl = `${baseUrl}/blogs/${monthYear}/${uniqueName}`;
        
        console.log('File saved successfully:', {
          path: filePath,
          url: imageUrl
        });
      }
      
      // Create blog with form data and image URL
      const blogPayload = {
        ...blogData,
        cover: imageUrl || blogData.cover || ''
      };
      
      const result = await this.blogService.createBlog(blogPayload);
      console.log('Blog with file created successfully');
      
      return {
        success: true,
        message: 'Blog created successfully',
        imageUrl: imageUrl,
        blog: result
      };
    } catch (error) {
      console.error('Blog creation error:', error);
      throw error;
    }
  }

  @Post()
  async createBlog(@Body() createBlogDto: any) {
    console.log('Create blog - Body:', createBlogDto);
    return await this.blogService.createBlog(createBlogDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('cover', {
    storage: require('multer').memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
  }))
  async createBlogWithFile(
    @Body() createBlogDto: CreateBlogDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    console.log('Create blog with file - Body:', createBlogDto);
    console.log('Create blog with file - File:', file ? `File: ${file.originalname}` : 'No file');
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

  @Put('admin/update-with-file/:id')
  @UseInterceptors(FileInterceptor('file'))
  async adminUpdateBlogWithFile(
    @Param('id') id: string,
    @Body() blogData: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      console.log('=== BLOG UPDATE WITH FILE ENDPOINT HIT ===');
      console.log('ID:', id);
      console.log('Body received:', blogData);
      console.log('File received:', file ? {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      } : 'No file');

      let imageUrl = '';
      
      // Upload file if provided
      if (file) {
        const now = new Date();
        const monthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' }).replace(' ', '');
        
        const path = require('path');
        const dashboardPublicDir = path.join(
          process.cwd(), 
          '..', 
          '..', 
          'sobitas-dashboard', 
          'dashboard-app', 
          'public', 
          'blogs', 
          monthYear
        );
        
        const fs = require('fs/promises');
        await fs.mkdir(dashboardPublicDir, { recursive: true });
        
        const ext = path.extname(file.originalname) || '.jpg';
        const baseName = path.basename(file.originalname, ext);
        const uniqueName = `${baseName}-${Date.now()}${ext}`;
        const filePath = path.join(dashboardPublicDir, uniqueName);
        
        await fs.writeFile(filePath, file.buffer);
        const baseUrl = process.env.BACKEND_API_URL || 'https://api.protein.tn';
        imageUrl = `${baseUrl}/blogs/${monthYear}/${uniqueName}`;
        
        console.log('File saved successfully:', {
          path: filePath,
          url: imageUrl
        });
      }
      
      // Update blog with form data and image URL
      const blogPayload = {
        ...blogData,
        cover: imageUrl || blogData.cover || ''
      };
      
      const result = await this.blogService.updateBlog(id, blogPayload);
      console.log('Blog updated successfully');
      
      return {
        success: true,
        message: 'Blog updated successfully',
        imageUrl: imageUrl,
        blog: result
      };
    } catch (error) {
      console.error('Blog update error:', error);
      throw error;
    }
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('cover', multerOptions))
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @UploadedFile() file?: Express.Multer.File
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