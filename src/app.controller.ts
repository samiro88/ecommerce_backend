import { Controller, Get } from '@nestjs/common';

@Controller() // No prefix
export class AppController {
  @Get()
  getRoot() {
    return { message: "API is running 🚀" };
  }
}