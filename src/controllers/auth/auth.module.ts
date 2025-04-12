// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminUser, AdminUserSchema } from '../../models/admin-user.schema';
import { Client, ClientSchema } from '../../models/client.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: AdminUser.name, schema: AdminUserSchema }]), MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema }])],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
