import { 
    Controller, 
    Get, 
    Post, 
    Put, 
    Param, 
    Body 
  } from '@nestjs/common';
  import { ClientService } from './client.service';
  import { CreateClientDto } from './dto/create-client.dto'; // Direct path to the create-client.dto.ts
  import { UpdateClientDto } from './dto/update-client.dto'; // Direct path to the update-client.dto.ts
  import { BulkDeleteDto } from './dto/bulk-delete.dto'; // Direct path to the bulk-delete.dto.ts
  
  
  @Controller()
  export class ClientController {
    constructor(private readonly clientService: ClientService) {}
  
    @Post('new')
    createGuestClient(@Body() clientData: CreateClientDto) {
      return this.clientService.createGuestClient(clientData);
    }
  
    @Get('get/all')
    getAllClients() {
      return this.clientService.getAllClients();
    }
  
    @Post('delete/many')
    deleteManyClients(@Body() ids: BulkDeleteDto) {
      return this.clientService.deleteManyClients(ids);
    }
  
    @Get('get/by-id/:id')
    getClientById(@Param('id') id: string) {
      return this.clientService.getClientById(id);
    }
  
    @Put('update/:id')
    updateClient(
      @Param('id') id: string,
      @Body() updateData: UpdateClientDto
    ) {
      return this.clientService.updateClient(id, updateData);
    }
  
    @Put('subscribe')
    subscribeButton(@Body() subscriptionData: any) {
      return this.clientService.subscribeButton(subscriptionData);
    }
  
    @Post('send-sms')
    sendSMS(@Body() smsData: any) {
      return this.clientService.sendSMS(smsData);
    }
  
    @Post('send-email')
    sendEmail(@Body() emailData: any) {
      return this.clientService.sendEmail(emailData);
    }
  }