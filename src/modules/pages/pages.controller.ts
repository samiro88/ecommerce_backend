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
    async createPage(@Body() createPageDto: CreatePageDto) {
      console.log('Controller received body:', createPageDto);
      return this.pagesService.createPage(createPageDto);
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
    async updatePage(
    @Param('id') id: string,
    @Body() updatePageDto: UpdatePageDto,
    ) {
    console.log('Update controller received body:', updatePageDto);
    return this.pagesService.updatePage(id, updatePageDto);
    }
    
    @Get(':id')
    async getPageById(@Param('id') id: string) {
    return this.pagesService.getPageById(id);
    }
    }