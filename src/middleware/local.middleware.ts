import { Middleware } from '@midwayjs/decorator';
import { PassportMiddleware, AuthenticateOptions } from '@midwayjs/passport';
import { LocalStrategy } from '../strategy/local.strategy';

@Middleware()
export class LocalPassportMiddleware extends PassportMiddleware(LocalStrategy) {
  // 设置 AuthenticateOptions
  getAuthenticateOptions(): Promise<AuthenticateOptions> | AuthenticateOptions {
    return {};
  }
}
