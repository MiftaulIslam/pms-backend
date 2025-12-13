import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from 'class-validator';

export class MoveDto {
  @ApiProperty({ description: 'Target collection ID', required: false })
  @IsString()
  @IsOptional()
  collectionId?: string | null;

  @ApiProperty({ description: 'Target parent folder ID', required: false })
  @IsString()
  @IsOptional()
  parentFolderId?: string | null;

  @ApiProperty({ description: 'New position (0-based)', required: false })
  @IsInt()
  @IsOptional()
  position?: number;
}

