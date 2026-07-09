import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccessTokenPayload } from '../services/token.service';

export const CurrentUser = createParamDecorator(
  (data: keyof AccessTokenPayload | undefined, context: ExecutionContext) => {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: AccessTokenPayload }>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
