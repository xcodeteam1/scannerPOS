import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

dotenv.config();

// --- Persistent public/images papkasini project root-da yaratish ---
const rootPublicPath = path.join(__dirname, '..', '..', 'public'); // project root/public
const imagesFolderPath = path.join(rootPublicPath, 'images');

if (!fs.existsSync(rootPublicPath)) {
  fs.mkdirSync(rootPublicPath);
  console.info('public folder created at project root.');
}

if (!fs.existsSync(imagesFolderPath)) {
  fs.mkdirSync(imagesFolderPath);
  console.info('images folder created at project root.');
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();

  // Static assets
  app.useStaticAssets(imagesFolderPath, {
    prefix: '/public/images',
  });

  // Swagger konfiguratsiyasi
  const config = new DocumentBuilder()
    .setTitle('Scanner-POS')
    .setDescription('Scanner-POS API')
    .setVersion('1.0')
    .addServer('http://213.139.210.248:3017', 'production server')
    .addServer('http://localhost:3000', 'local server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen(process.env.PORT, () => {
    console.log(`listened at http://localhost:${process.env.PORT}/swagger`);
  });
}
bootstrap();
