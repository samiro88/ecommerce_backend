import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Folder, FolderDocument } from '../models/folder.schema';
import { Media, MediaDocument } from '../models/media.schema';

@Injectable()
export class FolderService {
  constructor(
    @InjectModel(Folder.name) private readonly folderModel: Model<FolderDocument>,
    @InjectModel(Media.name) private readonly mediaModel: Model<MediaDocument>,
  ) {}

  async createFolder(data: { id: string; name: string; parentId?: string | null }): Promise<Folder> {
    if (data.parentId) {
      const parentFolder = await this.folderModel.findOne({ id: data.parentId });
      if (!parentFolder) {
        throw new BadRequestException(`Parent folder with id ${data.parentId} does not exist.`);
      }
    }

    const folder = new this.folderModel({
      id: data.id,
      name: data.name,
      parentId: data.parentId ?? null,
    });

    return folder.save();
  }

  async getFolderById(id: string): Promise<Folder> {
    const folder = await this.folderModel.findOne({ id });
    if (!folder) {
      throw new NotFoundException(`Folder with id ${id} not found.`);
    }
    return folder;
  }

  async listFolders(parentId: string | null = null): Promise<Folder[]> {
    return this.folderModel.find({ parentId }).sort({ name: 1 }).exec();
  }

  async updateFolder(id: string, updateData: Partial<{ name: string; parentId: string | null }>): Promise<Folder> {
    const folder = await this.getFolderById(id);

    if (updateData.parentId) {
      if (updateData.parentId === id) {
        throw new BadRequestException('Folder cannot be its own parent.');
      }
      const parentFolder = await this.folderModel.findOne({ id: updateData.parentId });
      if (!parentFolder) {
        throw new BadRequestException(`Parent folder with id ${updateData.parentId} does not exist.`);
      }
    }

    if (updateData.name !== undefined) folder.name = updateData.name;
    if (updateData.parentId !== undefined) folder.parentId = updateData.parentId;

    return folder.save();
  }

  async deleteFolder(id: string): Promise<void> {
    // Optional: you might want to check if folder has children or media before deleting
    const folder = await this.getFolderById(id);
    await this.folderModel.deleteOne({ id });
  }

  // NEW: Recursively build the folder tree with images
  async getFolderTreeWithImages(parentId: string | null = null): Promise<any[]> {
    const folders = await this.folderModel.find({ parentId }).sort({ name: 1 }).lean();
    const result: any[] = [];
    for (const folder of folders) {
      // Get images for this folder
      const images = await this.mediaModel.find({ folderId: folder.id }).lean();
      // Recursively get children
      const children = await this.getFolderTreeWithImages(folder.id);
      const folderNode: any = {
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId,
      };
      if (images.length > 0) {
        folderNode.images = images.map(img => img.id ? `public/${folder.id}/${img.id}` : null).filter(Boolean);
      }
      if (children.length > 0) {
        folderNode.children = children;
      }
      result.push(folderNode);
    }
    return result;
  }
}
