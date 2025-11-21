import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBoardingDto } from './dto/create-boarding.dto';
import { UpdateBoardingDto } from './dto/update-boarding.dto';
import { User } from '../../entities/user.entity';
import { Workspace } from '../../entities/workspace.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BoardingService {
  private readonly logger = new Logger(BoardingService.name);
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Workspace) private readonly workspaces: Repository<Workspace>,
  ) {}

  async complete(userId: string, dto: CreateBoardingDto, file?: Express.Multer.File) {
    this.logger.log(`Starting onboarding completion for user: ${userId}`);
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.warn(`User not found for onboarding: ${userId}`);
      return null;
    }

    this.logger.log(`Updating onboarding fields for user: ${userId}`);
    if (dto.name !== undefined) {
      user.name = dto.name ?? null;
      this.logger.log(`Name updated for user: ${userId} -> ${dto.name}`);
    }
    if (dto.heardAboutUs !== undefined) {
      user.heardAboutUs = dto.heardAboutUs ?? null;
      this.logger.log(`HeardAboutUs updated for user: ${userId} -> ${dto.heardAboutUs}`);
    }
    if (dto.interestIn !== undefined) {
      user.interestIn = dto.interestIn ?? null;
      this.logger.log(`InterestIn updated for user: ${userId} -> ${JSON.stringify(dto.interestIn)}`);
    }

    if (file) {
      this.logger.log(`Avatar upload during onboarding for user: ${userId}`);
      const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
      fs.mkdirSync(uploadsDir, { recursive: true });
      const ext = path.extname(file.originalname) || '.png';
      const filename = `${userId}${ext}`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, file.buffer);
      this.logger.log(`Avatar saved during onboarding for user ${userId} at ${filename}`);
      user.avatar = `/uploads/avatars/${filename}`;
    }

    user.onboarded = true;
    await this.users.save(user);
    this.logger.log(`User marked as onboarded: ${userId}`);

    // Create default workspace if none exists
    const ws = this.workspaces.create({
      name: user.name || 'My Workspace',
      ownerId: user.id,
    });
    await this.workspaces.save(ws);
    this.logger.log(`Default workspace created for user: ${userId}, workspace id: ${ws.id}`);

    this.logger.log(`Onboarding completed successfully for user: ${userId}`);
    return { user, workspace: ws, nextStep: 'onboarded' };
  }
}
