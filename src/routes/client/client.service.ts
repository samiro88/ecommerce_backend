import { 
    Injectable, 
    NotFoundException 
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import { Client } from '../models/client.model';
  
  @Injectable()
  export class ClientService {
    constructor(
      @InjectModel('Client') private clientModel: Model<Client>
    ) {}
  
    async createGuestClient(clientData: any) {
      const newClient = new this.clientModel(clientData);
      return newClient.save();
    }
  
    async getAllClients() {
      return this.clientModel.find().exec();
    }
  
    async deleteManyClients(ids: { ids: string[] }) {
      const result = await this.clientModel
        .deleteMany({ _id: { $in: ids.ids } })
        .exec();
      return { deletedCount: result.deletedCount };
    }
  
    async getClientById(id: string) {
      const client = await this.clientModel.findById(id).exec();
      if (!client) throw new NotFoundException('Client not found');
      return client;
    }
  
    async updateClient(id: string, updateData: any) {
      const updated = await this.clientModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .exec();
      if (!updated) throw new NotFoundException('Client not found');
      return updated;
    }
  
    async subscribeButton(subscriptionData: any) {
      // Implement your exact subscription logic here
      return { status: 'subscribed', ...subscriptionData };
    }
  
    async sendSMS(smsData: any) {
      // Implement your exact SMS service integration
      return { status: 'sms_sent', ...smsData };
    }
  
    async sendEmail(emailData: any) {
      // Implement your exact email service integration
      return { status: 'email_sent', ...emailData };
    }
  }