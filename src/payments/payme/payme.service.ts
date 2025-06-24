import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { EmailService } from './email.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from '../schemas/transaction.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import * as crypto from 'crypto';

@Injectable()
export class PaymeService {
  private readonly apiKey: string;
  private readonly url: string;

  constructor(
    private readonly emailService: EmailService,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) {
    this.apiKey = process.env.PAYMEE_API_KEY!;
    this.url = process.env.PAYMEE_URL!;
    if (!this.apiKey) throw new InternalServerErrorException('Missing PAYMEE_API_KEY');
    if (!this.url) throw new InternalServerErrorException('Missing PAYMEE_URL');
  }

 async createPayment(createPaymentDto: CreatePaymentDto) {
  const payload = {
    amount: createPaymentDto.amount,
    note: createPaymentDto.note,
    first_name: createPaymentDto.first_name,
    last_name: createPaymentDto.last_name,
    email: createPaymentDto.email,
    phone: createPaymentDto.phone,
    return_url: createPaymentDto.return_url,
    cancel_url: createPaymentDto.cancel_url,
    webhook_url: createPaymentDto.webhook_url,
    order_id: createPaymentDto.order_id,
  };

  try {
  const response = await axios.post(
    `${this.url}`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${this.apiKey}`,
      },
    }
  );

  // ADD THIS LINE:
  console.log('Paymee API response:', response.data);

  if (response.data?.status && response.data?.data?.payment_url) {
    await this.createTransaction({
      orderId: createPaymentDto.order_id,
      amount: createPaymentDto.amount,
      status: 'pending',
    });
    return { payment_url: response.data.data.payment_url };
  } else {
    throw new InternalServerErrorException(
      response.data?.message || 'Paymee did not return a payment URL'
    );
  }
} catch (error: any) {
  throw new InternalServerErrorException(
    `Paymee payment initiation failed: ${error?.response?.data?.message || error.message}`
  );
}
}

  async verifyPayment(paymentId: string) {
    const transaction = await this.transactionModel.findById(paymentId);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return {
      orderId: transaction.orderId,
      status: transaction.status,
      amount: transaction.amount,
      paymentToken: transaction.paymentToken,
      createdAt: transaction.createdAt,
    };
  }

  /**
   * Handles Paymee webhook notifications.
   * Validates checksum, updates transaction status, and sends email if needed.
   */
  
 async handleWebhook(payload: any, headers?: any) {
    const {
      token,
      order_id,
      payment_status,
      amount,
      email: customer_email,
      check_sum,
      // ...other fields
    } = payload;

    console.log('🚨 Webhook received from Paymee:', payload);

    // Normalize payment_status to 1 or 0 for checksum and status mapping
    let paymentStatusValue: number;
    if (typeof payment_status === "string") {
      paymentStatusValue = payment_status.toLowerCase() === "true" ? 1 : 0;
    } else {
      paymentStatusValue = payment_status ? 1 : 0;
    }

    const checksumString = `${token}${paymentStatusValue}${this.apiKey}`;
    const calculatedChecksum = crypto.createHash('md5').update(checksumString).digest('hex');

    if (!check_sum || check_sum !== calculatedChecksum) {
      console.error('❌ Invalid webhook checksum:', { received: check_sum, calculated: calculatedChecksum });
      throw new UnauthorizedException('Invalid webhook checksum');
    }

    // Map Paymee status to your internal status
    const status = paymentStatusValue === 1 ? 'paid' : 'failed';

    let transaction = await this.transactionModel.findOne({ orderId: order_id });
    if (transaction) {
      transaction.status = status;
      transaction.paymentToken = token;
      transaction.amount = amount;
      await transaction.save();
    } else {
      await this.createTransaction({
        orderId: order_id,
        paymentToken: token,
        amount,
        status,
      });
    }

    if (status === 'paid') {
      console.log(`✅ Payment success for Order ${order_id} | Transaction: ${token}`);
      await this.emailService.sendEmail(
        customer_email,
        'Payment Success',
        `Your payment for Order ${order_id} was successful. Transaction ID: ${token}`
      );
    } else {
      console.log(`❌ Payment failed for Order ${order_id}`);
      // Optionally send failure email
    }

    return { status: 'ok' };
  }

  async createTransaction(data: Partial<Transaction>) {
    const created = new this.transactionModel(data);
    return created.save();
  }
}