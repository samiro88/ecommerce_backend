import { Controller, Post, Delete, Get, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttachmentService } from './attachment.service';


@Controller('attachments')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.attachmentService.uploadFile(file);
  }

  @Delete(':id')
  async deleteAttachment(@Param('id') id: string) {
    return this.attachmentService.deleteAttachment(id);
  }

  @Get(':id')
  async getAttachment(@Param('id') id: string) {
    return this.attachmentService.getAttachment(id);
  }

  @Get(':id/metadata')
  async getAttachmentMetadata(@Param('id') id: string) {
    return this.attachmentService.getAttachmentMetadata(id);
  }
}