import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service, ServiceDocument } from '../../models/service.schema';
import { CreateServiceDto } from '../dto/create-service.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    // Generate id if not provided or empty
    const id = createServiceDto.id && createServiceDto.id.trim() !== '' 
      ? createServiceDto.id 
      : `service-${Date.now()}`;
    
    // Only check for duplicates if we have a real ID
    if (createServiceDto.id && createServiceDto.id.trim() !== '') {
      const exists = await this.serviceModel.findOne({ id });
      if (exists) {
        throw new ConflictException('Service with this id already exists');
      }
    }
    
    const created = new this.serviceModel({ ...createServiceDto, id });
    return created.save();
  }

  async findAll(): Promise<Service[]> {
    return this.serviceModel.find().sort({ id: 1 }).exec();
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceModel.findOne({ id });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<Service> {
    const updated = await this.serviceModel.findOneAndUpdate(
      { id },
      { $set: updateServiceDto },
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException('Service not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    console.log('Deleting service with id:', id);
    
    // Try to delete by id field first, then by _id if not found
    let deleted = await this.serviceModel.findOneAndDelete({ id });
    
    if (!deleted) {
      // Try deleting by MongoDB _id
      deleted = await this.serviceModel.findByIdAndDelete(id);
    }
    
    if (!deleted) {
      console.log('Service not found with id:', id);
      throw new NotFoundException('Service not found');
    }
    
    console.log('Service deleted successfully:', deleted._id);
  }

  async updateWithFile(
    id: string, 
    updateServiceDto: any, 
    file?: Express.Multer.File
  ): Promise<Service> {
    const updateData = { ...updateServiceDto };
    
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
        
        updateData.icon = `/produits/${monthYear}/${uniqueName}`;
      } catch (error) {
        console.error('Failed to upload icon:', error);
      }
    }
    
    return this.update(id, updateData);
  }
}
