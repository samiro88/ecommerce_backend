import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { TokenPayload } from './interfaces/token.interface';

@Injectable()
export class TokenMiddleware implements NestMiddleware {
  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
  }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.params.token || req.headers.authorization?.split(' ')[1];

      if (!token || token.trim() === '') {
        return res.status(401).json({ message: 'Token Not Received' });
      }

      const jwtData = await new Promise<TokenPayload>((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded as TokenPayload);
        });
      });

      req['user'] = jwtData;
      next();
    } catch (error) {
      return res.status(401).json({
        message: 
          error.name === 'TokenExpiredError' 
            ? 'Token Expired' 
            : 'Invalid Token'
      });
    }
  }
}

@Injectable()
export class ClientTokenMiddleware implements NestMiddleware {
  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
  }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.params.token || req.headers.authorization?.split(' ')[1];

      if (!token || token.trim() === '') {
        return res.status(401).json({ message: 'Token Not Received' });
      }

      const jwtData = await new Promise<TokenPayload>((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded as TokenPayload);
        });
      });

      req['client'] = jwtData;
      next();
    } catch (error) {
      return res.status(401).json({
        message: 
          error.name === 'TokenExpiredError' 
            ? 'Token Expired' 
            : 'Invalid Token'
      });
    }
  }
}