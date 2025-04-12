import { Document } from 'mongoose';

export type UserRole = 'superAdmin' | 'admin' | 'client';

export interface AdminUser {
  userName: string;
  password: string;
  role: UserRole;
}

export interface Client {
  name: string;
  email: string;
  password: string;
  phone1: string;
  ville: string;
  address: string;
  isGuest: boolean;
}

export type AdminUserDocument = AdminUser & Document;
export type ClientDocument = Client & Document;

export type User = AdminUserDocument | ClientDocument;