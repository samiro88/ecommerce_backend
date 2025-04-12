import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  HttpStatus,
} from '@nestjs/common';
import { MessagesService } from './routes/messages/messages.service'; 

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async createMessage(@Body() body: any) {
    return this.messagesService.createMessage(body);
  }

  @Get()
  async getAllMessages() {
    return this.messagesService.getAllMessages();
  }

  @Get(':id')
  async getMessageById(@Param('id') id: string) {
    return this.messagesService.getMessageById(id);
  }

  @Put(':id/status')
  async updateMessageStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.messagesService.updateMessageStatus(id, body.status);
  }
}