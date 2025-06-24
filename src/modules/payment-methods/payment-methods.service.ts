import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaymentMethod } from '../../models/payment-method.schema';
import { Model } from 'mongoose';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectModel(PaymentMethod.name)
    private readonly paymentMethodModel: Model<PaymentMethod>,
  ) {}

  async findAll() {
    return this.paymentMethodModel.find({ enabled: true }).sort({ sortOrder: 1 }).exec();
  }

  async findAllAdmin() {
    return this.paymentMethodModel.find().sort({ sortOrder: 1 }).exec();
  }

  async findOne(id: string) {
    return this.paymentMethodModel.findById(id).exec();
  }

  async create(data: Partial<PaymentMethod>) {
    return this.paymentMethodModel.create(data);
  }

  async update(id: string, data: Partial<PaymentMethod>) {
    return this.paymentMethodModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string) {
    return this.paymentMethodModel.findByIdAndDelete(id).exec();
  }
}