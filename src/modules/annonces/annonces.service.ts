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
    const exists = await this.annonceModel.findOne({ id: createAnnonceDto.id });
    if (exists) {
      throw new ConflictException('Annonce with this id already exists');
    }
    const created = new this.annonceModel(createAnnonceDto);
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
}
