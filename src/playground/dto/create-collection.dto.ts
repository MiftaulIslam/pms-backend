import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { IconType } from '../../entities/icon-type.enum';

export class CreateCollectionDto {
  @ApiProperty({ description: 'Workspace ID', example: 'workspace-uuid' })
  @IsString()
  @IsNotEmpty()
  workspaceId!: string;

  @ApiProperty({ description: 'Collection name', example: 'ZenFlow' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Collection description', example: 'My project collection', required: false })
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

