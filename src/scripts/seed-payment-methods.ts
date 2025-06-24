import mongoose from 'mongoose';
import { PaymentMethod, PaymentMethodSchema } from '../models/payment-method.schema';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/protein_db';

const PaymentMethodModel = mongoose.model('PaymentMethod', PaymentMethodSchema);

async function seed() {
  await mongoose.connect(MONGO_URI);

  await PaymentMethodModel.deleteMany({});

  await PaymentMethodModel.create([
    {
      key: 'payme',
      label: 'Payme',
      icon: '/images/checkout/payme.svg',
      enabled: true,
      sortOrder: 1,
    },
    {
      key: 'cash',
      label: 'Cash on Delivery',
      icon: '/images/checkout/cash.svg',
      enabled: true,
      sortOrder: 2,
    },
    {
      key: 'bank',
      label: 'Bank Transfer',
      icon: '/images/checkout/bank.svg',
      enabled: true,
      sortOrder: 3,
    },
  ]);

  console.log('Seeded payment methods!');
  process.exit(0);
}

seed();