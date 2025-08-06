import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Media, MediaDocument } from '../models/media.schema';

@Injectable()
export class MediaService {
 constructor(
  @InjectModel('Media') private readonly mediaModel: Model<MediaDocument>,
) {}

  async findById(mediaId: string): Promise<Media> {
    const media = await this.mediaModel.findOne({ id: mediaId });
    if (!media) {
      throw new NotFoundException(`Media not found with id ${mediaId}`);
    }
    return media;
  }

  async findAllWithPagination(offset: number, limit: number): Promise<[Media[], number]> {
    const data = await this.mediaModel.find().skip(offset).limit(limit).sort({ id: -1 }).exec();
    const total = await this.mediaModel.countDocuments();
    return [data, total];
  }

  // NEW: Update media (move, metadata)
  async updateMedia(mediaId: string, updateData: Partial<{ width: number; height: number; fileSize: number; folderId: string }>): Promise<Media> {
    const media = await this.mediaModel.findOne({ id: mediaId });
    if (!media) {
      throw new NotFoundException(`Media not found with id ${mediaId}`);
    }
    if (updateData.width !== undefined) media.width = updateData.width;
    if (updateData.height !== undefined) media.height = updateData.height;
    if (updateData.fileSize !== undefined) media.fileSize = updateData.fileSize;
    if (updateData.folderId !== undefined) media.folderId = updateData.folderId;
    await media.save();
    return media;
  }

  // NEW: Delete media
  async deleteMedia(mediaId: string): Promise<void> {
    const media = await this.mediaModel.findOne({ id: mediaId });
    if (!media) {
      throw new NotFoundException(`Media not found with id ${mediaId}`);
    }
    await this.mediaModel.deleteOne({ id: mediaId });
  }

  // NEW: List media by folder
 async findByFolderId(folderId: string): Promise<Media[]> {
  return this.mediaModel.find({ id: { $regex: `^public/${folderId}/` } }).sort({ id: -1 }).exec();
}
}