import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vente } from '../models/vente.schema'; 

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Vente.name) private readonly ventesModel: Model<Vente>,
  ) {}

  async getDailySales(days: number): Promise<any> {
    try {
      const salesData = await this.ventesModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
              },
            },
            sales: { $sum: '$totalAmount' },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);

      return salesData;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
