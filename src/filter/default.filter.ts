import { MidwayError } from '@midwayjs/core';
import { Catch } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

// 捕获所有错误
@Catch()
export class DefaultErrorFilter {
  async catch(err: MidwayError, ctx: Context) {
    // 错误日志
    ctx.logger.error('%j', err);
    return {
      code: err.code ?? 500,
      message: err.message ?? '服务器内部错误',
      data: null,
    };
  }
}
