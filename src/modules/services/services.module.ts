import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Service, ServiceSchema } from '../../models/service.schema';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }])],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
