import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { BoardingModule } from './boarding/boarding.module';
import { User } from '../entities/user.entity';
import { Workspace } from '../entities/workspace.entity';
import { Account } from '../entities/account.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Workspace, Account]), AuthModule, BoardingModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
