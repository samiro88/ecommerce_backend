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
  ) {}

  async create(createCoordinatesDto: CreateCoordinatesDto): Promise<Coordinates> {
    const exists = await this.coordinatesModel.findOne({ id: createCoordinatesDto.id });
    if (exists) {
      throw new ConflictException('Coordinates with this id already exists');
    }
    const created = new this.coordinatesModel(createCoordinatesDto);
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
}
