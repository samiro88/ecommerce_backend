import { Module } from '@nestjs/common';
import { MediaController } from '../controllers/media.controller';
import { MediaService } from '../services/media.service';
import { MediaCompressionService } from '../shared/utils/media-compression/media-compression.service';
import { RedisModule } from 'nestjs-redis';
import { MongooseModule } from '@nestjs/mongoose';
import { Media, MediaSchema } from '../models/media.schema';
import { Folder, FolderSchema } from '../models/folder.schema';
import { FolderService } from '../services/folder.service';
import { FolderController } from '../controllers/folder.controller';

@Module({
  imports: [
    RedisModule,
    MongooseModule.forFeature([
      { name: Media.name, schema: MediaSchema },
      { name: Folder.name, schema: FolderSchema },
    ]),
  ],
  controllers: [MediaController, FolderController],
  providers: [MediaService, MediaCompressionService, FolderService],
})
export class MediaModule {}
