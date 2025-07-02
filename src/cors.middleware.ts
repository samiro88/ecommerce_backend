//import { Injectable, NestMiddleware } from '@nestjs/common';

//@Injectable()
//export class CorsMiddleware implements NestMiddleware {
  //use(req: any, res: any, next: () => void) {
    //res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    //res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    //res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    //res.header('Access-Control-Allow-Credentials', true);
    //next();
  //}
//}



import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: any, res: any, next: () => void) {
    const allowedOrigins = [
      this.configService.get('CORSADMIN'),
      this.configService.get('CORSSTORE'),
    ].filter(Boolean);

    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  }
}
