import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { IUserCredential } from 'src/auth/strategies/jwt.strategy';

export const ReqUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as IUserCredential;
  },
);
