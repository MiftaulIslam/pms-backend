import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { BoardingModule } from './boarding/boarding.module';
import { User } from '../entities/user.entity';
import { Workspace } from '../entities/workspace.entity';
import { Account } from '../entities/account.entity';
import { JwtAuthGuard } from '../auth/auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User, Workspace, Account]), JwtModule.register({ secret: process.env.JWT_SECRET }), BoardingModule],
  controllers: [UsersController],
  providers: [UsersService, JwtAuthGuard],
  exports: [UsersService],
})
export class UsersModule {}
