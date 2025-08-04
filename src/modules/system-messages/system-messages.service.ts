import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SystemMessage, SystemMessageDocument } from '../../models/system-message.schema';
import { CreateSystemMessageDto } from '../dto/create-system-message.dto';
import { UpdateSystemMessageDto } from '../dto/update-system-message.dto';

@Injectable()
export class SystemMessagesService {
  constructor(
    @InjectModel(SystemMessage.name) private systemMessageModel: Model<SystemMessageDocument>,
  ) {}

  async create(createSystemMessageDto: CreateSystemMessageDto): Promise<SystemMessage> {
    const exists = await this.systemMessageModel.findOne({ id: createSystemMessageDto.id });
    if (exists) {
      throw new ConflictException('SystemMessage with this id already exists');
    }
    const created = new this.systemMessageModel(createSystemMessageDto);
    return created.save();
  }

  async findAll(): Promise<SystemMessage[]> {
    return this.systemMessageModel.find().sort({ id: 1 }).exec();
  }

  async findOne(id: string): Promise<SystemMessage> {
    const systemMessage = await this.systemMessageModel.findOne({ id });
    if (!systemMessage) {
      throw new NotFoundException('SystemMessage not found');
    }
    return systemMessage;
  }

  async update(id: string, updateSystemMessageDto: UpdateSystemMessageDto): Promise<SystemMessage> {
    const updated = await this.systemMessageModel.findOneAndUpdate(
      { id },
      { $set: updateSystemMessageDto },
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException('SystemMessage not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.systemMessageModel.findOneAndDelete({ id });
    if (!deleted) {
      throw new NotFoundException('SystemMessage not found');
    }
  }
}
