// src/services/whatsapp.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class WhatsappService {
  private apiUrl = 'https://api.gupshup.io/sm/api/v1/msg'; // Gupshup WhatsApp API URL

  constructor() {}

  async sendWhatsappMessage(to: string, message: string): Promise<void> {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          channel: 'whatsapp',
          source: process.env.GUPSHUP_PHONE_NUMBER_ID,
          destination: to,
          message: {
            type: 'text',
            text: message,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.GUPSHUP_API_KEY,
          },
        },
      );

      console.log(`✅ WhatsApp message sent successfully to ${to}:`, response.data);
    } catch (error) {
      console.error('❌ Failed to send WhatsApp message:', error.response?.data || error.message);
      throw error;
    }
  }
}
