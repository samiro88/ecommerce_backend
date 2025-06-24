import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attachment } from '../models/attachment.schema';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectModel(Attachment.name) 
    private readonly attachmentModel: Model<Attachment>
  ) {}

  async uploadFile(file: Express.Multer.File) {
    const attachment = new this.attachmentModel({
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: file.path,
    });
    return attachment.save();
  }

  async deleteAttachment(id: string) {
    const result = await this.attachmentModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }
  }

  async getAttachment(id: string) {
    const attachment = await this.attachmentModel.findById(id);
    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }
    return attachment;
  }

  async getAttachmentMetadata(id: string) {
    const attachment = await this.getAttachment(id); // Reuse the getAttachment method
    return {
      filename: attachment.filename,
      mimetype: attachment.mimetype,
      size: attachment.size,
      url: attachment.url,
    };
  }
}