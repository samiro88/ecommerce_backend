import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from '../dto/create-setting.dto';
import { UpdateSettingDto } from '../dto/update-setting.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }

  @Get()
  async findAll() {
    return this.settingsService.findAll();
  }

  @Get('by-key/:key')
  async findByKey(@Param('key') key: string) {
    return this.settingsService.findByKey(key);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.settingsService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(@Param('id') id: string, @Body() updateSettingDto: UpdateSettingDto) {
    return this.settingsService.update(id, updateSettingDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.settingsService.remove(id);
    return;
  }
}
