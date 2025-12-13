import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, IsBoolean, IsArray } from 'class-validator';
import { Priority } from '../../../entities/priority.enum';

export class CreateTaskDto {
  @ApiProperty({ description: 'Kanban column ID', example: 'column-uuid' })
  @IsString()
  kanbanColumnId!: string;

  @ApiProperty({ description: 'Task title', example: 'Design new user interface' })
  @IsString()
  title!: string;

  @ApiProperty({ description: 'Task description', required: false })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({ description: 'Task priority', enum: Priority, required: false })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority | null;

  @ApiProperty({ description: 'Assignee user ID', required: false })
  @IsString()
  @IsOptional()
  assigneeId?: string | null;

  @ApiProperty({ description: 'Due date', required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: Date | null;

  @ApiProperty({ description: 'Parent task ID (for subtasks)', required: false })
  @IsString()
  @IsOptional()
  parentTaskId?: string | null;

  @ApiProperty({ description: 'Task completion status', required: false, default: false })
  @IsBoolean()
  @IsOptional()
  done?: boolean;

  @ApiProperty({ description: 'Whether task has subtasks', required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isParent?: boolean;

  @ApiProperty({ description: 'Task tags', required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[] | null;
}

