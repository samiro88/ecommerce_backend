import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Annonce, AnnonceDocument } from '../../models/annonce.schema';
import { CreateAnnonceDto } from '../dto/create-annonce.dto';
import { UpdateAnnonceDto } from '../dto/update-annonce.dto';

@Injectable()
export class AnnoncesService {
  constructor(
    @InjectModel(Annonce.name) private annonceModel: Model<AnnonceDocument>,
  ) {}

  async create(createAnnonceDto: CreateAnnonceDto): Promise<Annonce> {
    // Generate id if not provided or empty
    const id = createAnnonceDto.id && createAnnonceDto.id.trim() !== '' 
      ? createAnnonceDto.id 
      : `annonce-${Date.now()}`;
    
    // Only check for duplicates if we have a real ID
    if (createAnnonceDto.id && createAnnonceDto.id.trim() !== '') {
      const exists = await this.annonceModel.findOne({ id });
      if (exists) {
        throw new ConflictException('Annonce with this id already exists');
      }
    }
    
    const created = new this.annonceModel({ ...createAnnonceDto, id });
    return created.save();
  }

  async findAll(): Promise<Annonce[]> {
    return this.annonceModel.find().sort({ id: 1 }).exec();
  }

  async findOne(id: string): Promise<Annonce> {
    const annonce = await this.annonceModel.findOne({ id });
    if (!annonce) {
      throw new NotFoundException('Annonce not found');
    }
    return annonce;
  }

  async update(id: string, updateAnnonceDto: UpdateAnnonceDto): Promise<Annonce> {
    const updated = await this.annonceModel.findOneAndUpdate(
      { id },
      { $set: updateAnnonceDto },
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException('Annonce not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.annonceModel.findOneAndDelete({ id });
    if (!deleted) {
      throw new NotFoundException('Annonce not found');
    }
  }

  async updateWithFiles(
    id: string, 
    updateAnnonceDto: any, 
    files?: any
  ): Promise<Annonce> {
    const updateData = { ...updateAnnonceDto };
    
    // Handle file uploads
    if (files) {
      const fs = require('fs/promises');
      const path = require('path');
      
      for (const [fieldName, fileArray] of Object.entries(files)) {
        if (fileArray && Array.isArray(fileArray) && fileArray.length > 0) {
          const file = fileArray[0];
          try {
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
            
            updateData[fieldName] = `/produits/${monthYear}/${uniqueName}`;
          } catch (error) {
            console.error(`Failed to upload ${fieldName}:`, error);
          }
        }
      }
    }
    
    return this.update(id, updateData);
  }
}
