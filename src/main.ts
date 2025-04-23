import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger konfiguratsiyasi
  const config = new DocumentBuilder()
    .setTitle('Branch API')
    .setDescription('Filiallar bilan ishlovchi REST API hujjati')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTOda yoq propertylarni olib tashlaydi
      forbidNonWhitelisted: true, // Notogri property topsa xatolik beradi
      transform: true, // typelarni avtomatik `transform` qiladi
    }),
  );

  await app.listen(process.env.PORT);
}
bootstrap();
