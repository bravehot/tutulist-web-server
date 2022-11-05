import { Inject, Middleware } from '@midwayjs/decorator';

import { httpError } from '@midwayjs/core';
import { JwtService } from '@midwayjs/jwt';

import type { Context, NextFunction } from '@midwayjs/koa';
@Middleware()
export class JwtMiddleware {
  @Inject()
  jwtService: JwtService;

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // 判断下有没有校验信息
      if (!ctx.headers['authorization']) {
        throw new httpError.BadRequestError();
      }
      // 从 header 上获取校验信息
      const parts = ctx.get('authorization').trim().split(' ');

      if (parts.length !== 2) {
        throw new httpError.BadRequestError();
      }

      const [scheme, token] = parts;

      if (/^Bearer$/i.test(scheme)) {
        try {
          await this.jwtService.verify(token, {
            complete: true,
          });
        } catch (error) {
          throw new httpError.UnauthorizedError();
        }
        await next();
      } else {
        throw new httpError.ForbiddenError();
      }
    };
  }

  ignore(ctx: Context): boolean {
    const ignorePathList = [
      '/api/user/register',
      '/api/user/sendCode',
      '/api/user/loginByPassword',
      '/api/user/loginByCode',
      '/api/user/forgetPassword',
      '/api/user/refreshToken',
    ];
    return ignorePathList.includes(ctx.path);
  }
}
