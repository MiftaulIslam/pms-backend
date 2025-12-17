import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { IconType } from '../../entities/icon-type.enum';

export class CreateFolderDto {
  @ApiProperty({ description: 'Collection ID (if folder is in collection)', required: false })
  @IsString()
  @IsOptional()
  collectionId?: string | null;

  @ApiProperty({ description: 'Parent folder ID (if folder is nested)', required: false })
  @IsString()
  @IsOptional()
  parentFolderId?: string | null;

  @ApiProperty({ description: 'Folder name', example: 'zenflow-frontend' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Folder description', required: false })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({ description: 'Icon type', enum: IconType, required: false })
  @IsEnum(IconType)
  @IsOptional()
  iconType?: IconType | null;

  @ApiProperty({ description: 'Icon (emoji string or will be set after image upload)', required: false })
  @IsString()
  @IsOptional()
  icon?: string | null;
}

