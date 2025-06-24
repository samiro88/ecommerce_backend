import { Module } from '@nestjs/common';
import { MediaController } from '../controllers/media.controller';
import { MediaService } from './media.service';
import { MediaCompressionService } from './media-compression.service';
import { RedisModule } from 'nestjs-redis';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from '../entities/media.entity';
@Module({
  imports: [
    RedisModule,
    TypeOrmModule.forFeature([Media]),
  ],
  controllers: [MediaController],
  providers: [MediaService, MediaCompressionService],
})
export class MediaModule {}