import { PartialType } from '@nestjs/swagger';
import { CreateBoardingDto } from './create-boarding.dto';

export class UpdateBoardingDto extends PartialType(CreateBoardingDto) {}
