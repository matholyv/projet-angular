import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // On autorise les messages de 50 Mo pour les photos !
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Exposer publiquement le dossier des images
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  app.enableCors();
  await app.listen(3000);
}
bootstrap();
