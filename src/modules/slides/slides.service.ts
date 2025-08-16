import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Slide, SlideDocument } from '../../models/slide.schema';
import { CreateSlideDto } from '../dto/create-slide.dto';
import { UpdateSlideDto } from '../dto/update-slide.dto';

@Injectable()
export class SlidesService {
  constructor(
    @InjectModel(Slide.name) private slideModel: Model<SlideDocument>,
  ) {}

  async create(createSlideDto: CreateSlideDto): Promise<Slide> {
    // Generate id if not provided or empty
    const id = createSlideDto.id && createSlideDto.id.trim() !== '' 
      ? createSlideDto.id 
      : `slide-${Date.now()}`;
    
    // Only check for duplicates if we have a real ID
    if (createSlideDto.id && createSlideDto.id.trim() !== '') {
      const exists = await this.slideModel.findOne({ id });
      if (exists) {
        throw new ConflictException('Slide with this id already exists');
      }
    }
    
    const created = new this.slideModel({ ...createSlideDto, id });
    return created.save();
  }

  async findAll(): Promise<Slide[]> {
    return this.slideModel.find().sort({ id: 1 }).exec();
  }

  async findOne(id: string): Promise<Slide> {
    const slide = await this.slideModel.findOne({ id });
    if (!slide) {
      throw new NotFoundException('Slide not found');
    }
    return slide;
  }

  async update(id: string, updateSlideDto: UpdateSlideDto): Promise<Slide> {
    const updated = await this.slideModel.findOneAndUpdate(
      { id },
      { $set: updateSlideDto },
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException('Slide not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.slideModel.findOneAndDelete({ id });
    if (!deleted) {
      throw new NotFoundException('Slide not found');
    }
  }

  async updateWithFile(
    id: string, 
    updateSlideDto: any, 
    file?: Express.Multer.File
  ): Promise<Slide> {
    const updateData = { ...updateSlideDto };
    
    // Handle file upload
    if (file) {
      try {
        const fs = require('fs/promises');
        const path = require('path');
        
        const now = new Date();
        const monthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' }).replace(' ', '');
        
        const dashboardPublicDir = path.join(
          process.cwd(), '..', '..', 'sobitas-dashboard', 'dashboard-app', 'public', 'produits', monthYear
        );
        
        await fs.mkdir(dashboardPublicDir, { recursive: true });
        
        const ext = path.extname(file.originalname) || '.jpg';
        const baseName = path.basename(file.originalname, ext);
        const uniqueName = `${baseName}-${Date.now()}${ext}`;
        const filePath = path.join(dashboardPublicDir, uniqueName);
        
        await fs.writeFile(filePath, file.buffer);
        
        updateData.cover = `/produits/${monthYear}/${uniqueName}`;
      } catch (error) {
        console.error('Failed to upload cover:', error);
      }
    }
    
    return this.update(id, updateData);
  }
}
