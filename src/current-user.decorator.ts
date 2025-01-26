import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from './auth/auth.service';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    // if (user?.userId) {
    //   user.userId = String(user.userId);
    // }
    console.log('CurrentUser user', user);
    console.log('CurrentUser data', data);
    return data ? user?.[data] : user;
  },
);
