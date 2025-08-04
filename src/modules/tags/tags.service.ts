import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tag, TagDocument } from '../../models/tag.schema';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectModel(Tag.name) private tagModel: Model<TagDocument>,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const exists = await this.tagModel.findOne({ id: createTagDto.id });
    if (exists) {
      throw new ConflictException('Tag with this id already exists');
    }
    const created = new this.tagModel(createTagDto);
    return created.save();
  }

  async findAll(): Promise<Tag[]> {
    return this.tagModel.find().sort({ id: 1 }).exec();
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagModel.findOne({ id });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const updated = await this.tagModel.findOneAndUpdate(
      { id },
      { $set: updateTagDto },
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException('Tag not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.tagModel.findOneAndDelete({ id });
    if (!deleted) {
      throw new NotFoundException('Tag not found');
    }
  }
}
