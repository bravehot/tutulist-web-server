import { CustomStrategy, PassportStrategy } from '@midwayjs/passport';
import { Strategy } from 'passport-local';
import { Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import * as bcrypt from 'bcryptjs';

import { User as UserEntity } from '@/entity/user';

import { DefaultError } from '@/error/default.error';

@CustomStrategy()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  @InjectEntityModel(UserEntity)
  userModel: Repository<UserEntity>;

  // 策略的验证
  async validate(mobile, password) {
    const user = await this.userModel.findOne({
      where: {
        mobile,
      },
      select: ['password'],
    });
    const errorMsg = '账号或密码错误';

    if (!user) {
      throw new DefaultError(errorMsg);
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      return user;
    }
    throw new DefaultError(errorMsg);
  }

  // 自定义 field 参数，默认是 username 和 password
  getStrategyOptions(): any {
    return {
      usernameField: 'mobile',
      passwordField: 'password',
    };
  }
}
