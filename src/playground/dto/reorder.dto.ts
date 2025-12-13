import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class ReorderDto {
  @ApiProperty({ description: 'New position (0-based)', example: 0 })
  @IsInt()
  @Min(0)
  position!: number;
}

