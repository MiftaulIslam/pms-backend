import { Body, Controller, Post, Req, UploadedFile, UseInterceptors, UseGuards, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        heardAboutUs: { type: 'string' },
        'interestIn[]': { type: 'array', items: { type: 'string' } },
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOkResponse({ description: 'Onboarding complete, user and default workspace created' })
  @Post('complete')
  @UseInterceptors(FileInterceptor('avatar'))
  complete(
    @Req() req: any,
    @Body() body: CreateBoardingDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user?.id || req.headers['x-user-id'];
    this.logger.log(`Onboarding completion request for user: ${userId}`);
    if (file) {
      this.logger.log(`Avatar file received during onboarding for user: ${userId}, filename: ${file.originalname}`);
    }
    // Handle interests both as interestIn and interestIn[] sent by Swagger UI
    const interestIn = (body as any).interestIn ?? (body as any)['interestIn[]'];
    const payload = { ...body, interestIn };
    this.logger.log(`Onboarding payload for user ${userId}: ${JSON.stringify(payload)}`);
    return this.boardingService.complete(String(userId), payload, file);
  }
}
