import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateProfileDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async findById(id: string) {
    this.logger.log(`Finding user by id: ${id}`);
    return this.users.findOne({ where: { id } });
  }

  async findMe(userId: string, req: any) {
    this.logger.log(`Fetching authenticated user: ${userId}`);
    this.logger.log(`req: ${req}`);
    return this.findById(userId);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    this.logger.log(`Updating profile for user: ${userId}`);
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.warn(`User not found for profile update: ${userId}`);
      return null;
    }

    if (dto.name !== undefined) user.name = dto.name ?? null;
    if (dto.avatar !== undefined) user.avatar = dto.avatar ?? null;

    this.logger.log(`Saving updated profile for user: ${userId}`);
    await this.users.save(user);
    this.logger.log(`Profile updated successfully for user: ${userId}`);
    return user;
  }
}
