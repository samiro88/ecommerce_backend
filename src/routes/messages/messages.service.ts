import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../models/messages';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) {}

  async getAllMessages() {
    try {
      const messages = await this.messageModel.find().sort({ createdAt: -1 }).exec();
      return {
        success: true,
        data: messages,
      };
    } catch (error) {
      throw new Error('Failed to fetch messages');
    }
  }

  async getMessageById(id: string) {
    try {
      const message = await this.messageModel.findById(id).exec();
      
      if (!message) {
        throw new Error('Message not found');
      }

      return {
        success: true,
        data: message,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateMessageStatus(id: string, status: string) {
    try {
      // Validate status
      const validStatuses = ['Read', 'Unread', 'Replied'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status value');
      }

      const message = await this.messageModel.findById(id).exec();
      
      if (!message) {
        throw new Error('Message not found');
      }

      message.status = status;
      await message.save();

      return {
        success: true,
        data: message,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async createMessage(body: any) {
    try {
      const { name, email, phone, subject, message } = body;

      // Validate required fields
      if (!name || !email || !message) {
        throw new Error('Name, email and message are required');
      }

      const newMessage = await this.messageModel.create({
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
        status: 'Unread',
      });

      return {
        success: true,
        data: newMessage,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}