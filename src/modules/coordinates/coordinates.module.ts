import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Coordinates, CoordinatesSchema } from '../../models/coordinates.schema';
import { CoordinatesService } from './coordinates.service';
import { CoordinatesController } from './coordinates.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Coordinates.name, schema: CoordinatesSchema }])],
  controllers: [CoordinatesController],
  providers: [CoordinatesService],
  exports: [CoordinatesService],
})
export class CoordinatesModule {}
