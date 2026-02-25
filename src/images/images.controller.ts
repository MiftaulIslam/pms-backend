import {
    Controller,
    Post,
    Get,
    UseInterceptors,
    UploadedFile,
    Query,
    Body,
    UseGuards,
    BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { UploadImageDto } from './dto/upload-image.dto';

@ApiTags('images')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('images')
export class ImagesController {
    constructor(private readonly imagesService: ImagesService) { }

    @Post('upload')
    @ApiOperation({ summary: 'Upload an image' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                image: { type: 'string', format: 'binary', description: 'Image file to upload' },
                userId: { type: 'string', description: 'Optional: User ID associated with this image' },
                workspaceId: { type: 'string', description: 'Optional: Workspace ID associated with this image' },
                collectionId: { type: 'string', description: 'Optional: Collection ID associated with this image' },
                folderId: { type: 'string', description: 'Optional: Folder ID associated with this image' },
                itemId: { type: 'string', description: 'Optional: Item ID associated with this image' },
            },
            required: ['image'],
        },
    })
    @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
    @ApiResponse({ status: 400, description: 'Invalid file or missing required fields' })
    @UseInterceptors(FileInterceptor('image'))
    async uploadImage(
        @UploadedFile() file: Express.Multer.File,
        @Body() uploadImageDto: UploadImageDto,
    ) {
        if (!file) {
            throw new BadRequestException('Image file is required');
        }

        return this.imagesService.uploadImage(file, uploadImageDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get image by ID' })
    @ApiQuery({ name: 'id', description: 'Image ID', required: true })
    @ApiResponse({ status: 200, description: 'Image retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Image not found' })
    async getImage(@Query('id') id: string) {
        if (!id) {
            throw new BadRequestException('Image ID is required');
        }
        return this.imagesService.getImage(id);
    }
}

