import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '../entities/image.entity';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { UploadImageDto } from './dto/upload-image.dto';

@Injectable()
export class ImagesService {
    private readonly logger = new Logger(ImagesService.name);

    constructor(
        @InjectRepository(Image)
        private readonly imagesRepository: Repository<Image>,
    ) { }

    async uploadImage(file: Express.Multer.File, dto: UploadImageDto) {
        // Generate UUID for the image
        const imageId = randomUUID();

        // Sanitize original filename
        const originalName = file.originalname || 'image';
        const sanitizedName = originalName
            .toLowerCase()
            .replace(/[^a-z0-9.-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        // Get file extension
        const ext = path.extname(originalName) || '.png';

        // Generate filename: uuid-manipulateName-timestamp
        const timestamp = Date.now();
        const filename = `${imageId}-${sanitizedName}-${timestamp}${ext}`;

        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), 'uploads');
        fs.mkdirSync(uploadsDir, { recursive: true });

        // Save file to uploads folder
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, file.buffer);

        // Generate URL
        const url = `/uploads/${filename}`;

        // Create image entity
        const image = this.imagesRepository.create({
            id: imageId,
            name: originalName,
            filename,
            url,
            userId: dto.userId || null,
            workspaceId: dto.workspaceId || null,
            collectionId: dto.collectionId || null,
            folderId: dto.folderId || null,
            itemId: dto.itemId || null,
        });

        const savedImage = await this.imagesRepository.save(image);

        this.logger.log(`Image uploaded: ${filename} with ID: ${imageId}`);

        return {
            id: savedImage.id,
            name: savedImage.name,
            filename: savedImage.filename,
            url: savedImage.url,
            userId: savedImage.userId,
            workspaceId: savedImage.workspaceId,
            collectionId: savedImage.collectionId,
            folderId: savedImage.folderId,
            itemId: savedImage.itemId,
            createdAt: savedImage.createdAt,
            updatedAt: savedImage.updatedAt,
        };
    }

    async getImage(id: string) {
        const image = await this.imagesRepository.findOne({
            where: { id },
        });

        if (!image) {
            throw new NotFoundException('Image not found');
        }

        return {
            id: image.id,
            name: image.name,
            filename: image.filename,
            url: image.url,
            userId: image.userId,
            workspaceId: image.workspaceId,
            collectionId: image.collectionId,
            folderId: image.folderId,
            itemId: image.itemId,
            createdAt: image.createdAt,
            updatedAt: image.updatedAt,
        };
    }
}

