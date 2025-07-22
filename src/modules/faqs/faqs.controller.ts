import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { CreateFaqDto } from '../dto/create-faq.dto';
import { UpdateFaqDto } from '../dto/update-faq.dto';

@Controller('faqs')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Get()
  async findAll() {
    const data = await this.faqsService.findAll();
    return { message: 'FAQs fetched successfully', data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.faqsService.findOne(id);
    return { message: 'FAQ fetched successfully', data };
  }

  @Post()
  async create(@Body() createFaqDto: CreateFaqDto) {
    const data = await this.faqsService.create(createFaqDto);
    return { message: 'FAQ created successfully', data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateFaqDto: UpdateFaqDto) {
    const data = await this.faqsService.update(id, updateFaqDto);
    return { message: 'FAQ updated successfully', data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.faqsService.remove(id);
  }
}