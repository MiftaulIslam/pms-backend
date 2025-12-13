import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateColumnDto {
  @ApiProperty({ description: 'Kanban board ID', example: 'board-uuid' })
  @IsString()
  @IsNotEmpty()
  kanbanBoardId!: string;

  @ApiProperty({ description: 'Column title', example: 'To Do' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Column color', required: false })
  @IsString()
  @IsOptional()
  color?: string | null;
}

