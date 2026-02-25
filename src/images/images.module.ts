import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { Image } from '../entities/image.entity';
import { AuthModule } from '../auth/auth.module';
import { User } from '../entities/user.entity';
import { Account } from '../entities/account.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Image, User, Account]), AuthModule],
    controllers: [ImagesController],
    providers: [ImagesService],
    exports: [ImagesService],
})
export class ImagesModule { }

