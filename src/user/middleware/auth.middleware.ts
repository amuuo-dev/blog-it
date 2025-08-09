/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from '../user.service';
import { AuthRequest } from 'types/req-interface';
import { verify } from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: AuthRequest, _res: Response, next: () => void) {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader)
      throw new UnauthorizedException('Authorization header missing');

    const token = authorizationHeader.split(' ')[1];

    if (!token)
      throw new UnauthorizedException(
        'Token missing from Authorization header',
      );

    try {
      const decode = verify(token, process.env.JWT_SECRET!);
      if (typeof decode !== 'string') {
        const user = await this.userService.findById(decode.id);
        req.user = user;
        return next();
      }
      //if decode is a string
      throw new UnauthorizedException('Invalid token payload');
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
