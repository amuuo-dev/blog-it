import { Request } from 'express';
import { UserEntity } from 'src/user/entity/user.entity';

export interface AuthRequest extends Request {
  user?: UserEntity | null;
}
