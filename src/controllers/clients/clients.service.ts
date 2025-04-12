// clients.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export interface Client {
  email: string;
  password?: string;
  isGuest: boolean;
  subscriber?: boolean;
}

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel('Client') private readonly clientModel: Model<Client>,
  ) {}

  async subscribeButton(email: string) {
    if (!email) throw new Error('Email is required');
    let client = await this.clientModel.findOne({ email });

    if (client) {
      client.subscriber = true;
      await client.save();
    } else {
      client = new this.clientModel({
        email,
        isGuest: true,
        subscriber: true,
      });
      await client.save();
    }

    const clientResponse = client.toObject();
    delete clientResponse.password;
    return {
      success: true,
      data: clientResponse,
      message: 'Subscription updated successfully',
    };
  }

  async createGuestClient(createClientDto: any) {
    const { email } = createClientDto;
    const existingClient = await this.clientModel.findOne({ email, isGuest: false });
    if (existingClient) {
      throw new Error('Email already registered. Please login to continue.');
    }

    const existingGuest = await this.clientModel.findOne({ email, isGuest: true });
    if (existingGuest) {
      const updatedGuest = await this.clientModel.findByIdAndUpdate(
        existingGuest._id,
        createClientDto,
        { new: true }
      );
      return { success: true, data: updatedGuest };
    }

    const guestClient = new this.clientModel({ ...createClientDto, isGuest: true });
    const savedGuestClient = await guestClient.save();
    return { success: true, data: savedGuestClient };
  }

  async convertGuestToClient(email: string, password: string) {
    const guestClient = await this.clientModel.findOne({ email, isGuest: true });
    if (!guestClient) throw new Error('Guest account not found');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    guestClient.password = hashedPassword;
    guestClient.isGuest = false;
    await guestClient.save();

    const token = jwt.sign({ id: guestClient._id }, process.env.JWT_SECRET || 'default_secret', {
      expiresIn: '30d',
    });

    const clientResponse = guestClient.toObject();
    delete clientResponse.password;
    return { success: true, data: clientResponse, token };
  }

  async register(email: string, password: string) {
    const existingClient = await this.clientModel.findOne({ email });
    if (existingClient && !existingClient.isGuest) {
      throw new Error('Email already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (existingClient && existingClient.isGuest) {
      existingClient.password = hashedPassword;
      existingClient.isGuest = false;
      const savedClient = await existingClient.save();
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in the environment variables');
      }
      const jwtSecret = process.env.JWT_SECRET || 'default_secret';
      const token = jwt.sign({ id: savedClient._id }, jwtSecret, {
        expiresIn: '30d',
      });

      const clientResponse = savedClient.toObject();
      delete clientResponse.password;
      return { success: true, data: clientResponse, token };
    }

    const client = new this.clientModel({
      email,
      password: hashedPassword,
      isGuest: false,
    });
    const savedClient = await client.save();
    const jwtSecret = process.env.JWT_SECRET || 'default_secret';
    const token = jwt.sign({ id: savedClient._id }, jwtSecret, {
      expiresIn: '30d',
    });

    const clientResponse = savedClient.toObject();
    delete clientResponse.password;
    return { success: true, data: clientResponse, token };
  }

  async login(email: string, password: string) {
    const client = await this.clientModel.findOne({ email }).select('+password');
    if (!client) throw new Error('Invalid credentials');

    if (!client.password) throw new Error('Password is not set for this client');
    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) throw new Error('Invalid credentials');

    const jwtSecret = process.env.JWT_SECRET || 'default_secret';
    const token = jwt.sign({ id: client._id }, jwtSecret, {
      expiresIn: '30d',
    });

    const clientResponse = client.toObject();
    delete clientResponse.password;
    return { success: true, data: clientResponse, token };
  }

  async getProfile(clientId: string) {
    const client = await this.clientModel.findById(clientId).populate('ordersId').populate('cart.productId').populate('wishlist');
    if (!client) throw new Error('Client not found');
    return { success: true, data: client };
  }

  async updateProfile(clientId: string, updateClientDto: any) {
    const client = await this.clientModel.findByIdAndUpdate(clientId, updateClientDto, { new: true, runValidators: true });
    if (!client) throw new Error('Client not found');
    return { success: true, data: client };
  }

  // Additional methods can be added as needed...
}
