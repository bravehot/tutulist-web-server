import { IMiddleware } from '@midwayjs/core';
import { Middleware } from '@midwayjs/decorator';
import { NextFunction, Context } from '@midwayjs/koa';
/**
 * Response 中间件，返回成功态的 response
 */
@Middleware()
export class ResponseMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (_ctx: Context, next: NextFunction) => {
      const data = await next();
      return {
        code: 200,
        message: 'ok',
        data,
      };
    };
  }

  static getName = (): string => 'response';

  match = ctx => ctx.path.indexOf('/api') !== -1;
}
