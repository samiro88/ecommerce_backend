import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from '../entities/media.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
  ) {}

  async findById(mediaId: string): Promise<Media> {
    const media = await this.mediaRepository.findOne({ where: { id: +mediaId } });
    if (!media) {
      throw new Error(`Media not found with id ${mediaId}`);
    }
    return media;
  }

  async findAllWithPagination(offset: number, limit: number): Promise<[Media[], number]> {
    const [data, total] = await this.mediaRepository.findAndCount({
      skip: offset,
      take: limit,
      order: { id: 'DESC' }, 
    });
    return [data, total];
  }
}
