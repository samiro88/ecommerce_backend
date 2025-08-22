import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Enable CORS for dashboard
  app.enableCors({
    origin: true, // Allow all origins during development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  
  // Serve static files in all environments
  const uploadPath = process.env.UPLOAD_PATH || join(process.cwd(), 'public');
  app.useStaticAssets(uploadPath, {
    prefix: '/',
  });
  
  console.log(`Serving static files from: ${uploadPath}`);
  
  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`Backend running on port ${port}`);
}
bootstrap();