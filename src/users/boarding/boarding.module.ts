import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { BoardingService } from './boarding.service';
import { BoardingController } from './boarding.controller';
import { User } from '../../entities/user.entity';
import { Workspace } from '../../entities/workspace.entity';
import { Account } from '../../entities/account.entity';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Workspace, Account]), AuthModule],
  controllers: [BoardingController],
  providers: [BoardingService],
})
export class BoardingModule {}
