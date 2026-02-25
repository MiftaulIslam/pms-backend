import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateWorkspaceDto {
  @ApiProperty({ description: 'Workspace name', example: 'My Team Workspace' })
  name: string;

  @ApiPropertyOptional({ description: 'Workspace logo URL or image ID', example: '/uploads/image.png' })
  @IsOptional()
  @IsString()
  logo?: string;
}
