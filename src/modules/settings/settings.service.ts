import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting, SettingDocument } from '../../models/setting.schema';
import { CreateSettingDto } from '../dto/create-setting.dto';
import { UpdateSettingDto } from '../dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Setting.name) private settingModel: Model<SettingDocument>,
  ) {}

  async create(createSettingDto: CreateSettingDto): Promise<Setting> {
    const exists = await this.settingModel.findOne({ $or: [ { id: createSettingDto.id }, { key: createSettingDto.key } ] });
    if (exists) {
      throw new ConflictException('Setting with this id or key already exists');
    }
    const created = new this.settingModel(createSettingDto);
    return created.save();
  }

  async findAll(): Promise<Setting[]> {
    return this.settingModel.find().sort({ order: 1 }).exec();
  }

  async findOne(id: string): Promise<Setting> {
    const setting = await this.settingModel.findOne({ id });
    if (!setting) {
      throw new NotFoundException('Setting not found');
    }
    return setting;
  }

  async findByKey(key: string): Promise<Setting> {
    const setting = await this.settingModel.findOne({ key });
    if (!setting) {
      throw new NotFoundException('Setting not found');
    }
    return setting;
  }

  async update(id: string, updateSettingDto: UpdateSettingDto): Promise<Setting> {
    const updated = await this.settingModel.findOneAndUpdate(
      { id },
      { $set: updateSettingDto },
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException('Setting not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.settingModel.findOneAndDelete({ id });
    if (!deleted) {
      throw new NotFoundException('Setting not found');
    }
  }
}
