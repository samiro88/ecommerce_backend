import { Module } from '@nestjs/common';
import { PreviewController } from './preview.controller';
import { PreviewService } from './preview.service';

@Module({
  controllers: [PreviewController],
  providers: [PreviewService],
})
export class PreviewModule {}
// This module is responsible for generating previews of email templates. It includes a controller and a service to handle the logic of fetching and rendering the templates.