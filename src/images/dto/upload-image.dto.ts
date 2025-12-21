import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadImageDto {
    @ApiPropertyOptional({ description: 'User ID associated with this image' })
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiPropertyOptional({ description: 'Workspace ID associated with this image' })
    @IsOptional()
    @IsString()
    workspaceId?: string;

    @ApiPropertyOptional({ description: 'Collection ID associated with this image' })
    @IsOptional()
    @IsString()
    collectionId?: string;

    @ApiPropertyOptional({ description: 'Folder ID associated with this image' })
    @IsOptional()
    @IsString()
    folderId?: string;

    @ApiPropertyOptional({ description: 'Item ID associated with this image' })
    @IsOptional()
    @IsString()
    itemId?: string;
}

