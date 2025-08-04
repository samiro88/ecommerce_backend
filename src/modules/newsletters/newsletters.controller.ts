import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NewslettersService } from './newsletters.service';
import { CreateNewsletterDto } from '../dto/create-newsletter.dto';
import { UpdateNewsletterDto } from '../dto/update-newsletter.dto';

@Controller('newsletters')
export class NewslettersController {
  constructor(private readonly newslettersService: NewslettersService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createNewsletterDto: CreateNewsletterDto) {
    return this.newslettersService.create(createNewsletterDto);
  }

  @Get()
  async findAll() {
    return this.newslettersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.newslettersService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(@Param('id') id: string, @Body() updateNewsletterDto: UpdateNewsletterDto) {
    return this.newslettersService.update(id, updateNewsletterDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.newslettersService.remove(id);
    return;
  }
}
