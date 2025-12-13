import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { ItemType } from '../../entities/item-type.enum';
import { IconType } from '../../entities/icon-type.enum';

export class CreateItemDto {
  @ApiProperty({ description: 'Collection ID (required - item must belong to a collection)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty()
  collectionId!: string;

  @ApiProperty({ description: 'Parent folder ID (optional - if item is in folder)', required: false })
  @IsString()
  @IsOptional()
  parentFolderId?: string | null;

  @ApiProperty({ description: 'Item name', example: 'List' })
  @IsString()
  name!: string;

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
}

