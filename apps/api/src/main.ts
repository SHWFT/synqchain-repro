import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Cookie parser middleware
  app.use(cookieParser());

  // CORS configuration
  app.enableCors({
    origin: process.env.WEB_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.API_PORT || 4000;
  await app.listen(port);
  
  console.log(`🚀 SynqChain API is running on: http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/healthz`);
}

bootstrap();
