import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Folder, FolderDocument } from '../models/folder.schema';

@Injectable()
export class FolderService {
  constructor(
    @InjectModel(Folder.name) private readonly folderModel: Model<FolderDocument>,
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

    return await folder.save();
  }

  async getFolderById(id: string): Promise<Folder> {
    const folder = await this.folderModel.findOne({ id });
    if (!folder) {
      throw new NotFoundException(`Folder with id ${id} not found.`);
    }
    return folder;
  }

  async listFolders(parentId: string | null = null): Promise<Folder[]> {
    // Debug: log all folders
    const allFolders = await this.folderModel.find().lean();
    console.log('All folders in DB:', allFolders);
    return this.folderModel.find({ parentId }).sort({ name: 1 }).exec();
  }

  async updateFolder(
    id: string,
    updateData: Partial<{ name: string; parentId: string | null }>,
  ): Promise<Folder> {
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

    // Only call save() if folder is a Mongoose document
    if (typeof (folder as any).save === 'function') {
      return await (folder as any).save();
    } else {
      throw new Error('Folder is not a Mongoose document');
    }
  }

  async deleteFolder(id: string): Promise<void> {
    const folder = await this.getFolderById(id);
    await this.folderModel.deleteOne({ id });
  }

  async getFolderTreeWithImages(): Promise<any[]> {
    // FULL DEBUG: log all collections, all folders, types, and a test query
    const collections = await this.folderModel.db!.db!.listCollections().toArray();
    console.log('Collections in DB:', collections.map(c => c.name));
    const allFolders = await this.folderModel.find().lean();
    console.log('All folders in DB (tree):', allFolders);
    console.log('Number of folders:', allFolders.length);
    if (allFolders.length > 0) {
      allFolders.forEach(f => {
        console.log(`id: ${f.id}, name: ${f.name}, parentId:`, f.parentId, 'type:', typeof f.parentId);
      });
    }
    const test = await this.folderModel.findOne({ id: 'annonces' }).lean();
    console.log('Test findOne annonces:', test);
    if (!allFolders.length) return [];

    // Build a map for quick lookup
    const folderMap: Record<string, any> = {};
    allFolders.forEach(folder => {
      (folder as any).children = [];
      folderMap[folder.id] = folder;
    });

    // Build the tree
    const tree: any[] = [];
    allFolders.forEach(folder => {
      if (folder.parentId) {
        folderMap[folder.parentId]?.children?.push(folder);
      } else {
        tree.push(folder);
      }
    });
    return tree;
  }
}
