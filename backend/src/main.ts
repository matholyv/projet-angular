import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // <--- Autorise Angular à discuter avec NestJS
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
