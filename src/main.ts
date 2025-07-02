import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { DatabaseService } from './db/database.provider'; // Use existing service

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // ======================
  // CORS Configuration
  // ======================
  function parseOrigins(origins: string | undefined) {
    return origins ? origins.split(",").map(o => o.trim()) : [];
  }

  const corsOrigins = [
    ...parseOrigins(configService.get('CORSADMIN')),
    ...parseOrigins(configService.get('CORSSTORE')),
  ].filter(Boolean);

  const corsOptions = {
    origin: corsOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  };
  app.enableCors(corsOptions);

  // ======================
  // Middleware
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
    // Using your existing DatabaseService
    const databaseService = app.get(DatabaseService);
    await databaseService.connectToDatabase(); // Explicit connection call
    
    await app.listen(PORT);
    console.log(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
  } catch (error) {
    console.error('❌ Error', error);
    process.exit(1);
  }
}

bootstrap();