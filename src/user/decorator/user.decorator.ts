/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from 'types/req-interface';

export const User = createParamDecorator((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<AuthRequest>();
  const user = request.user;

  if (!user) {
    return null;
  }
  if (data) {
    return user[data];
  }
  return user;
});
