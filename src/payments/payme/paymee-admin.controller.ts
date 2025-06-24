import { Controller, Get, Query, Res } from '@nestjs/common';
import { PaymeService } from './payme.service';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction, TransactionDocument } from '../schemas/transaction.schema';
import { Model } from 'mongoose';

@Controller('admin/payments/paymee')
export class PaymeeAdminController {
  constructor(
    private readonly paymeService: PaymeService,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) {}

  @Get('transactions')
  async getTransactions(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit = '50',
    @Query('page') page = '1',
  ) {
    const query: any = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { paymentToken: { $regex: search, $options: 'i' } },
      ];
    }
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await this.transactionModel.countDocuments(query);
    const transactions = await this.transactionModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    return { total, transactions };
  }

  @Get('transactions/export')
  async exportTransactions(
    @Res() res: Response,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const query: any = {};
    if (status) query.status = status;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }
    const transactions = await this.transactionModel.find(query).sort({ createdAt: -1 });
    const csv = [
      'Order ID,Amount,Status,Payment Token,Created At,Updated At',
      ...transactions.map(t =>
        [
          t.orderId,
          t.amount,
          t.status,
          t.paymentToken,
          t.createdAt ? new Date(t.createdAt).toISOString() : '',
          t.updatedAt ? new Date(t.updatedAt).toISOString() : '',
        ].join(',')
      ),
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="paymee_transactions.csv"');
    res.send(csv);
  }
}