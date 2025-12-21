import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBoardingDto {
  @ApiPropertyOptional({ description: 'Display name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'How user heard about us' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  heardAboutUs?: string;

  @ApiPropertyOptional({ type: [String], description: 'Interests' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interestIn?: string[];

  @ApiPropertyOptional({ description: 'Avatar URL or image ID' })
  @IsOptional()
  @IsString()
  avatar?: string;
}
