import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateKanbanBoardDto {
  @ApiProperty({ description: 'Item ID (must be type=list)', example: 'item-uuid' })
  @IsString()
  @IsNotEmpty()
  itemId!: string;
}

