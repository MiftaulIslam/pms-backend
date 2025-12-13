import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class MoveTaskDto {
  @ApiProperty({ description: 'Target kanban column ID', example: 'column-uuid' })
  @IsString()
  kanbanColumnId!: string;

  @ApiProperty({ description: 'New position (0-based)', example: 0 })
  @IsInt()
  @Min(0)
  position!: number;
}

