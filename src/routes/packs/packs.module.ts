import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PacksController } from './packs.controller';
import { PacksService } from './packs.service';
import { Pack, PackSchema } from '../../models/pack.schema';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CloudinaryModule } from '../../shared/utils/cloudinary/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pack.name, schema: PackSchema }]),
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit like original
    }),
    CloudinaryModule,
  ],
  controllers: [PacksController],
  providers: [PacksService],
  exports: [PacksService],
})
export class PacksModule {}