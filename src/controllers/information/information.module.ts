import { Module ,forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InformationService } from './information.service';
import { InformationController } from './information.controller';
import { Information, InformationSchema } from '../../models/information.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Information.name, schema: InformationSchema }, // Register Information schema
    ]),
    forwardRef(() => InformationModule), // Use forwardRef to resolve circular dependency
  ],
  controllers: [InformationController],
  providers: [InformationService],
  exports: [InformationService], // Export the service if needed in other modules
})
export class InformationModule {}