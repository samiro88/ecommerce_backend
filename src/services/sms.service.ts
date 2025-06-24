// src/services/sms.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class SmsService {
  private apiUrl = process.env.WINSMS_API_BASE_URL || 'https://www.winsmspro.com/sms/sms/api';
  private apiKey = process.env.WINSMS_API_KEY;
  private sender = process.env.WINSMS_SENDER;

  constructor() {}

  async sendSms(to: string, message: string): Promise<void> {
    const encodedMessage = encodeURIComponent(message);
    const url = `${this.apiUrl}?action=send-sms&api_key=${this.apiKey}&to=${to}&from=${this.sender}&sms=${encodedMessage}`;

    try {
      const response = await axios.get(url);
      console.log(`✅ SMS sent successfully to ${to}:`, response.data);
    } catch (error) {
      console.error('❌ Failed to send SMS:', error.response?.data || error.message);
      throw error;
    }
  }
}
