import { HttpStatus, MidwayError } from '@midwayjs/core';
// 业务逻辑错误，统一往外抛 500 状态码
export class DefaultError extends MidwayError {
  constructor(message: string) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR.toString());
  }
}
