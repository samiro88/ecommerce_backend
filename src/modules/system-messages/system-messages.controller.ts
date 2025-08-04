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
import { SystemMessagesService } from './system-messages.service';
import { CreateSystemMessageDto } from '../dto/create-system-message.dto';
import { UpdateSystemMessageDto } from '../dto/update-system-message.dto';

@Controller('system-messages')
export class SystemMessagesController {
  constructor(private readonly systemMessagesService: SystemMessagesService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createSystemMessageDto: CreateSystemMessageDto) {
    return this.systemMessagesService.create(createSystemMessageDto);
  }

  @Get()
  async findAll() {
    return this.systemMessagesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.systemMessagesService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(@Param('id') id: string, @Body() updateSystemMessageDto: UpdateSystemMessageDto) {
    return this.systemMessagesService.update(id, updateSystemMessageDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.systemMessagesService.remove(id);
    return;
  }
}
