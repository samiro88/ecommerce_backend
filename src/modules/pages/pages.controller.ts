import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
    NotFoundException,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { PagesService } from './pages.service';
  import { CreatePageDto } from '../dto/create-page.dto';
  import { UpdatePageDto } from '../dto/update-page.dto';
  
  @Controller('pages')
  export class PagesController {
    constructor(private readonly pagesService: PagesService) {}
  
    @Get()
    async getAllPages() {
      return this.pagesService.getAllPages();
    }
  
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async createPage(
      @Body() createPageDto: CreatePageDto,
      @UploadedFile() file: Express.Multer.File,
    ) {
      return this.pagesService.createPage(createPageDto, file);
    }
  
    @Get('slug/:slug')
    async getPageBySlug(@Param('slug') slug: string) {
    return this.pagesService.getPageBySlug(slug);
    }
    
    @Delete(':id')
    async deletePage(@Param('id') id: string) {
    return this.pagesService.deletePage(id);
    }
    
    @Put(':id')
    @UseInterceptors(FileInterceptor('file'))
    async updatePage(
    @Param('id') id: string,
    @Body() updatePageDto: UpdatePageDto,
    @UploadedFile() file: Express.Multer.File,
    ) {
    return this.pagesService.updatePage(id, updatePageDto, file);
    }
    
    @Get(':id')
    async getPageById(@Param('id') id: string) {
    return this.pagesService.getPageById(id);
    }
    }