import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { MessagesService } from './messages.service';
  
  @Controller('messages')
  export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}
  
    @Get('get')
    async getAllMessages() {
      try {
        return await this.messagesService.getAllMessages();
      } catch (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get(':id')
    async getMessageById(@Param('id') id: string) {
      try {
        return await this.messagesService.getMessageById(id);
      } catch (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Patch(':id/status')
    async updateMessageStatus(
      @Param('id') id: string,
      @Body() body: { status: string },
    ) {
      try {
        return await this.messagesService.updateMessageStatus(id, body.status);
      } catch (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Post('new')
    async createMessage(@Body() body: any) {
      try {
        return await this.messagesService.createMessage(body);
      } catch (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }