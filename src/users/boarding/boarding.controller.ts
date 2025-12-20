import { Body, Controller, Post, Req, UseGuards, Logger } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BoardingService } from './boarding.service';
import { CreateBoardingDto } from './dto/create-boarding.dto';
import { JwtAuthGuard } from '../../auth/auth.guard';

@ApiTags('users/boarding')
@Controller('users/boarding')
export class BoardingController {
  private readonly logger = new Logger(BoardingController.name);
  constructor(private readonly boardingService: BoardingService) {}

  @ApiOperation({ summary: 'Complete onboarding' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Onboarding complete, user and default workspace created' })
  @Post('complete')
  complete(
    @Req() req: any,
    @Body() body: CreateBoardingDto,
  ) {
    const userId = req.user?.id || req.headers['x-user-id'];
    this.logger.log(`Onboarding completion request for user: ${userId}`);
    // Handle interests both as interestIn and interestIn[] sent by Swagger UI
    const interestIn = (body as any).interestIn ?? (body as any)['interestIn[]'];
    const payload = { ...body, interestIn };
    this.logger.log(`Onboarding payload for user ${userId}: ${JSON.stringify(payload)}`);
    return this.boardingService.complete(String(userId), payload);
  }
}
