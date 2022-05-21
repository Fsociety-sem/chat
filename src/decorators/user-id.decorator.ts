import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import { RequestWithUserId } from 'src/auth/types/user-request'

export const GetUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext): number => {
    const type = context.getType()
    const { userId } = {
      http: context.switchToHttp().getRequest<RequestWithUserId>(),
      ws: context.switchToWs().getClient().handshake,
    }[type]

    return userId
  },
)
