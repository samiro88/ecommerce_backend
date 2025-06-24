import { Controller, Get, Query, NotFoundException, Res } from '@nestjs/common';
import { Response } from 'express';
import { PreviewService } from './preview.service';

@Controller('preview')
export class PreviewController {
  constructor(private readonly previewService: PreviewService) {}

  @Get()
  async preview(
    @Query('template') template: string,
    @Res() res: Response
  ) {
    console.log('✅ Incoming request for template:', template);

    if (!template) {
      throw new NotFoundException('Template parameter is required');
    }

    const previewData = await this.previewService.generatePreview(template);

    if (!previewData) {
      throw new NotFoundException('Template not found');
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(previewData); // ✅ This avoids the content-type warning
  }
}
