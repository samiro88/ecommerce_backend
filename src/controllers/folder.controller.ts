import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FolderService } from '../services/folder.service';
import { Folder } from '../models/folder.schema';

@Controller('folders')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Post()
  async createFolder(
    @Body() body: { id: string; name: string; parentId?: string | null },
  ): Promise<Folder> {
    return this.folderService.createFolder(body);
  }

  // Place this route BEFORE @Get(':id')
  @Get('tree')
  async getFullFolderTree() {
    return this.folderService.getFolderTreeWithImages();
  }

  @Get(':id')
  async getFolderById(@Param('id') id: string): Promise<Folder> {
    return this.folderService.getFolderById(id);
  }

  @Get()
  async listFolders(@Query('parentId') parentId?: string): Promise<Folder[]> {
    // If no parentId specified, defaults to null (root folders)
    return this.folderService.listFolders(parentId ?? null);
  }

  @Patch(':id')
  async updateFolder(
    @Param('id') id: string,
    @Body() updateData: Partial<{ name: string; parentId: string | null }>,
  ): Promise<Folder> {
    return this.folderService.updateFolder(id, updateData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFolder(@Param('id') id: string): Promise<void> {
    await this.folderService.deleteFolder(id);
  }
}