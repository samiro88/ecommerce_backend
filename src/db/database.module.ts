import { Module } from '@nestjs/common';
import { DatabaseService } from './database.provider';

@Module({
  providers: [DatabaseService],
  exports: [DatabaseService], // 🟢 Allows other modules to use it
})
export class DatabaseModule {}