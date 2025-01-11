import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import 'dotenv/config';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return process.env.DB_HOST;
  }
}
