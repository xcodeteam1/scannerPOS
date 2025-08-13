import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express'; // ✅ MUHIM
import { join } from 'path';

dotenv.config();

// public/images papkalarini avtomatik yaratish
const publicFolderPath = path.join(__dirname, '..', 'public');
const imagesFolderPath = path.join(publicFolderPath, 'images');

if (!fs.existsSync(publicFolderPath)) {
  fs.mkdirSync(publicFolderPath);
  console.info('public folder created.');
}
if (!fs.existsSync(imagesFolderPath)) {
  fs.mkdirSync(imagesFolderPath);
  console.info('images folder created.');
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();

  app.useStaticAssets(join(__dirname, '..', 'public', 'images'), {
    prefix: '/public/images',
  });

  const config = new DocumentBuilder()
    .setTitle('Scanner-POS')
    .setDescription('Scanner-POS API')
    .setVersion('1.0')
    .addServer('http://localhost:3000', 'local server')
    .addServer('http://213.139.210.248:3000', 'production server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // ← BU MUHIM
      },
    }),
  );

  await app.listen(process.env.PORT || 3000, () => {
    console.log(`listened at http://localhost:${process.env.PORT}/swagger`);
  });
}
bootstrap();
