import { Injectable, OnModuleInit } from '@nestjs/common';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PreviewService implements OnModuleInit {
  private templatesPath = path.join(process.cwd(), 'src/templates');
  private mainTemplate: HandlebarsTemplateDelegate;

  async onModuleInit() {
    this.registerHelpers();
    this.registerPartials();
    this.loadMainTemplate();
  }

  private registerHelpers() {
    handlebars.registerHelper('eq', (a, b) => a === b);
  }

  private registerPartials() {
    const partialsDir = this.templatesPath;
    const files = fs.readdirSync(partialsDir);

    files.forEach((file) => {
      if (file.endsWith('.hbs') && file !== 'preview.hbs') {
        const partialName = path.basename(file, '.hbs');
        const partialContent = fs.readFileSync(
          path.join(partialsDir, file),
          'utf8'
        );
        handlebars.registerPartial(partialName, partialContent);
      }
    });
  }

  private loadMainTemplate() {
    const previewPath = path.join(this.templatesPath, 'preview/preview.hbs');
    
    if (fs.existsSync(previewPath)) {
      const templateContent = fs.readFileSync(previewPath, 'utf-8');
      this.mainTemplate = handlebars.compile(templateContent);
    } else {
      throw new Error(`Main preview template not found at: ${previewPath}`);
    }
  }

  async generatePreview(templateName: string) {
    if (!this.mainTemplate) {
      throw new Error('Main template not loaded!');
    }

    return this.mainTemplate({
      template: templateName,
      customerName: 'John Doe',
      orderNumber: '123456',
      customerEmail: 'john@example.com',
      unsubscribeLink: 'http://unsubscribe.com',
    });
  }
}