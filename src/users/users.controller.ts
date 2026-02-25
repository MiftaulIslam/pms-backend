import {
  Body,
  Request,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  Logger,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/create-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get authenticated user' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Authenticated user' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    this.logger.log("me REQUEST", req)
    if (!req.user?.id) {
      throw new UnauthorizedException('Not authenticated');
    }
    const userId = req?.user?.id;
    this.logger.log(`Fetching authenticated user (me) with id: ${userId}`);
    return this.usersService.findMe(String(userId), req);
  }

  @ApiOperation({ summary: 'Find user by id' })
  @ApiOkResponse({ description: 'User found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.log(`Fetching user by id: ${id}`);
    return this.usersService.findById(id);
  }

  @ApiOperation({ summary: 'Update profile (name/avatar)' })
  @Patch('profile')
  updateProfile(
    @Req() req: any,
    @Body() dto: UpdateProfileDto,
  ) {
    const userId = req.user?.id || req.headers['x-user-id'];
    this.logger.log(`Updating profile for user: ${userId}`);
    return this.usersService.updateProfile(String(userId), dto);
  }
}
