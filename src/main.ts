// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { connectToDatabase } from './db/connection';

async function bootstrap() {
  // Create app instance
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // ======================
  // CORS Configuration (identical to original)
  // ======================
  const corsOptions = {
    origin: [
      configService.get('CORSADMIN'),
      configService.get('CORSSTORE'),
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  };
  app.enableCors(corsOptions);

  // ======================
  // Middleware (identical functionality)
  // ======================
  app.use(cookieParser(configService.get('COOKIE_SECRET')));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // ======================
  // Global Validation Pipe
  // ======================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  // ======================
  // Database Connection & Server Start
  // ======================
  const PORT = configService.get('PORT') || 5000;
  const NODE_ENV = configService.get('NODE_ENV') || 'development';

  try {
    await connectToDatabase();
    await app.listen(PORT);
    console.log(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
  } catch (error) {
    console.error('❌ Error', error);
    process.exit(1);
  }
}

bootstrap();