import { Module } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Commande, CommandeSchema } from '../../models/commande.schema';
import { User, UserSchema } from '../../models/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
           { name: Commande.name, schema: CommandeSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    {
      provide: 'DATABASE_CONNECTION',
      useExisting: getConnectionToken(),
    },
  ],
  exports: [DashboardService],
})
export class DashboardModule {}