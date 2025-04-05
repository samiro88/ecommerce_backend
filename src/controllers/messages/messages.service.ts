import {
    Injectable,
    HttpException,
    HttpStatus,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import { Message } from '../models/messages';
  
  @Injectable()
  export class MessagesService {
    constructor(
      @InjectModel(Message.name) private messageModel: Model<Message>,
    ) {}
  
    async createMessage(body: any) {
      const { name, email, phone, subject, message } = body;
  
      // Basic validation
      if (!name || !email || !message) {
        throw new HttpException(
          'Please provide name, email and message',
          HttpStatus.BAD_REQUEST,
        );
      }
  
      // Create new message
      const newMessage = await this.messageModel.create({
        name,
        email,
        phone, // Optional
        subject, // Optional
        message,
        status: 'Unread', // Default status
      });
  
      return {
        success: true,
        data: newMessage,
      };
    }
  
    async getAllMessages() {
      const messages = await this.messageModel
        .find({})
        .sort({ createdAt: -1 })
        .exec();
  
      return {
        success: true,
        count: messages.length,
        data: messages,
      };
    }
  
    async getMessageById(id: string) {
      const message = await this.messageModel.findById(id).exec();
  
      if (!message) {
        throw new NotFoundException('Message not found');
      }
  
      return {
        success: true,
        data: message,
      };
    }
  
    async updateMessageStatus(id: string, status: string) {
      // Validate status input
      if (!status || !['Read', 'Replyed', 'Unread'].includes(status)) {
        throw new HttpException(
          "Invalid status. Status must be 'Read', 'Replyed', or 'Unread'",
          HttpStatus.BAD_REQUEST,
        );
      }
  
      const message = await this.messageModel.findById(id).exec();
  
      if (!message) {
        throw new NotFoundException('Message not found');
      }
  
      // Update only the status field
      message.status = status;
      await message.save();
  
      return {
        success: true,
        data: message,
      };
    }
  }