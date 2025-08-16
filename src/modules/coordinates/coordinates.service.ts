import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coordinates, CoordinatesDocument } from '../../models/coordinates.schema';
import { CreateCoordinatesDto } from '../dto/create-coordinates.dto';
import { UpdateCoordinatesDto } from '../dto/update-coordinates.dto';

@Injectable()
export class CoordinatesService {
  constructor(
    @InjectModel(Coordinates.name) private coordinatesModel: Model<CoordinatesDocument>,
  ) {
    console.log('CoordinatesService initialized');
  }

  async create(createCoordinatesDto: CreateCoordinatesDto): Promise<Coordinates> {
    // Generate id if not provided or empty
    const id = createCoordinatesDto.id && createCoordinatesDto.id.trim() !== '' 
      ? createCoordinatesDto.id 
      : `coord-${Date.now()}`;
    
    // Only check for duplicates if we have a real ID
    if (createCoordinatesDto.id && createCoordinatesDto.id.trim() !== '') {
      const exists = await this.coordinatesModel.findOne({ id });
      if (exists) {
        throw new ConflictException('Coordinates with this id already exists');
      }
    }
    
    const created = new this.coordinatesModel({ ...createCoordinatesDto, id });
    return created.save();
  }

  async findAll(): Promise<Coordinates[]> {
    return this.coordinatesModel.find().sort({ id: 1 }).exec();
  }

  async findOne(id: string): Promise<Coordinates> {
    const coordinates = await this.coordinatesModel.findOne({ id });
    if (!coordinates) {
      throw new NotFoundException('Coordinates not found');
    }
    return coordinates;
  }

  async update(id: string, updateCoordinatesDto: UpdateCoordinatesDto): Promise<Coordinates> {
    const updated = await this.coordinatesModel.findOneAndUpdate(
      { id },
      { $set: updateCoordinatesDto },
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException('Coordinates not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.coordinatesModel.findOneAndDelete({ id });
    if (!deleted) {
      throw new NotFoundException('Coordinates not found');
    }
  }

  async updateWithFiles(
    id: string, 
    updateCoordinatesDto: any, 
    files?: { logo?: Express.Multer.File[], logo_facture?: Express.Multer.File[], logo_footer?: Express.Multer.File[] }
  ): Promise<Coordinates> {
    const updateData = { ...updateCoordinatesDto };
    
    // Handle file uploads
    if (files) {
      const fs = require('fs/promises');
      const path = require('path');
      
      for (const [fieldName, fileArray] of Object.entries(files)) {
        if (fileArray && fileArray.length > 0) {
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
