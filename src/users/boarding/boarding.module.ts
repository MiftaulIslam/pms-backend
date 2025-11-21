import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardingService } from './boarding.service';
import { BoardingController } from './boarding.controller';
import { User } from '../../entities/user.entity';
import { Workspace } from '../../entities/workspace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Workspace])],
  controllers: [BoardingController],
  providers: [BoardingService],
})
export class BoardingModule {}
