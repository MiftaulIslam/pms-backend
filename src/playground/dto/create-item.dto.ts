import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ItemType } from '../../entities/item-type.enum';
import { IconType } from '../../entities/icon-type.enum';
import { CreateColumnDto } from './create-column.dto';

export class CreateItemDto {
  @ApiProperty({ description: 'Collection ID (required - item must belong to a collection)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty()
  collectionId!: string;

  @ApiProperty({ description: 'Parent folder ID (optional - if item is in folder)', required: false })
  @IsString()
  @IsOptional()
  parentFolderId?: string | null;

  @ApiProperty({ description: 'Item name', example: 'My List' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Item description', example: 'Project management list', required: false })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({ description: 'Item type', enum: ItemType, example: ItemType.LIST })
  @IsEnum(ItemType)
  type!: ItemType;

  @ApiProperty({ description: 'Icon type', enum: IconType, required: false })
  @IsEnum(IconType)
  @IsOptional()
  iconType?: IconType | null;

  @ApiProperty({ description: 'Icon (emoji string or will be set after image upload)', required: false })
  @IsString()
  @IsOptional()
  icon?: string | null;

  @ApiProperty({ 
    description: 'Columns for list type items. If provided, these columns will be created instead of default columns. Only applicable when type is "list".', 
    type: [CreateColumnDto],
    required: false,
    example: [
      { title: 'To Do', position: 0, color: '#3b82f6' },
      { title: 'In Progress', position: 1, color: '#f59e0b' },
      { title: 'Done', position: 2, color: '#10b981' }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateColumnDto)
  @IsOptional()
  columns?: CreateColumnDto[] | null;
}

