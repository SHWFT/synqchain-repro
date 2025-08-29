import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          constraints: error.constraints,
          value: error.value,
        }));
        return new ValidationPipe().createExceptionFactory()(formattedErrors);
      },
    })
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Cookie parser middleware
  app.use(cookieParser());

  // CORS configuration
  const webOrigins = process.env.WEB_ORIGIN
    ? process.env.WEB_ORIGIN.split(',').map((origin) => origin.trim())
    : ['http://localhost:5173'];

  app.enableCors({
    origin: webOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200,
  });

  // Setup Swagger (only in non-production environments)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('SynqChain API')
      .setDescription(
        'SynqChain MVP - Procurement and supplier management platform'
      )
      .setVersion('1.0')
      .addTag('auth', 'Authentication endpoints')
      .addTag('suppliers', 'Supplier management')
      .addTag('projects', 'Project management')
      .addTag('po', 'Purchase order management')
      .addTag('files', 'File upload and management')
      .addTag('analytics', 'Analytics and reporting')
      .addBearerAuth()
      .addCookieAuth('access_token')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    console.log(
      `📚 API documentation available at http://localhost:${port || 4000}/docs`
    );
  }

  const port = process.env.API_PORT || 4000;
  await app.listen(port);

  console.log(`🚀 SynqChain API is running on: http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/healthz`);
}

bootstrap();
