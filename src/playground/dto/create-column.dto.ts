import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateColumnDto {
  @ApiProperty({ description: 'Column title', example: 'To Do' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Column position (0-based)', example: 0 })
  @IsNumber()
  position!: number;

  @ApiProperty({ description: 'Column color (hex color)', example: '#3b82f6', required: false })
  @IsString()
  @IsOptional()
  color?: string | null;
}

