import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { connect, disconnect } from 'mongoose';

@Injectable() // 🟢 Makes it injectable across the app
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  // 🟢 Using NestJS lifecycle hooks
  async onModuleInit() {
    await this.connectToDatabase();
  }

  async onModuleDestroy() {
    await this.disconnectFromDatabase();
  }

  // ============== EXISTING LOGIC ==============
  async connectToDatabase() {
    try {
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        throw new Error("MONGODB_URI is not defined in environment variables");
      }
      await connect(mongoUri);
      console.log("Connected to database 🗃️");
    } catch (error) {
      console.log("❌ Error connecting to database", error);
      throw new Error("Error connecting to database");
    }
  }

  async disconnectFromDatabase() {
    try {
      await disconnect();
    } catch (error) {
      console.log(error);
      throw new Error("Could not Disconnect From MongoDB");
    }
  }
}