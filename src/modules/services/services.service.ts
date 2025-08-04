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
    const exists = await this.serviceModel.findOne({ id: createServiceDto.id });
    if (exists) {
      throw new ConflictException('Service with this id already exists');
    }
    const created = new this.serviceModel(createServiceDto);
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
    const deleted = await this.serviceModel.findOneAndDelete({ id });
    if (!deleted) {
      throw new NotFoundException('Service not found');
    }
  }
}
