import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import 'dotenv/config';
import * as cookieParser from 'cookie-parser';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { INestApplication } from '@nestjs/common';

let app: INestApplication | null = null;

async function bootstrap(): Promise<INestApplication> {
    if (!app) {
        app = await NestFactory.create(AppModule);
        (app as any).use(cookieParser());
        (app as any).enableCors({
            origin: true,
            credentials: true,
        });

        const config = new DocumentBuilder()
            .setTitle('PMS API')
            .setDescription('API documentation for PMS backend')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('docs', app, document);

        await app.init();
    }
    return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const app = await bootstrap();
    const server = app.getHttpServer();

    // Handle the request
    await new Promise((resolve, reject) => {
        server.emit('request', req, res);
        res.on('finish', resolve);
        res.on('error', reject);
    });
}
