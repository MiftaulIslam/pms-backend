import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateProfileDto } from './dto/create-user.dto';
import * as fs from 'fs';
import * as path from 'path';

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

  async updateProfile(userId: string, dto: UpdateProfileDto, file?: Express.Multer.File) {
    this.logger.log(`Updating profile for user: ${userId}`);
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.warn(`User not found for profile update: ${userId}`);
      return null;
    }

    if (dto.name !== undefined) user.name = dto.name ?? null;

    if (file) {
      this.logger.log(`Avatar upload for user: ${userId}`);
      const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
      fs.mkdirSync(uploadsDir, { recursive: true });
      const ext = path.extname(file.originalname) || '.png';
      const filename = `${userId}${ext}`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, file.buffer);
      this.logger.log(`Avatar saved for user ${userId} at ${filename}`);
      user.avatar = `/uploads/avatars/${filename}`;
    }

    this.logger.log(`Saving updated profile for user: ${userId}`);
    await this.users.save(user);
    this.logger.log(`Profile updated successfully for user: ${userId}`);
    return user;
  }
}
