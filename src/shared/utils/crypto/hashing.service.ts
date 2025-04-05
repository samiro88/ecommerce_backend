// src/shared/utils/crypto/hashing.service.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashingService {
  private readonly defaultSaltRounds = 10; // Preserved default value

  /**
   * Hash a password using bcrypt
   * @param password - The plain text password to hash
   * @param saltRounds - The cost factor (default: 10)
   * @returns The hashed password
   * @throws Error if hashing fails
   */
  async hash(password: string, saltRounds: number = this.defaultSaltRounds): Promise<string> {
    try {
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      throw new Error(`Error hashing password: ${error.message}`); // Preserved error message
    }
  }

  /**
   * Compare a plain text password with a hashed password
   * @param password - The plain text password to check
   * @param hashedPassword - The hashed password to compare against
   * @returns True if the password matches, false otherwise
   * @throws Error if comparison fails
   */
  async compare(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      throw new Error(`Error comparing passwords: ${error.message}`); // Preserved error message
    }
  }
}