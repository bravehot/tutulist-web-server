import { Config, Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Context } from '@midwayjs/koa';
import { Repository } from 'typeorm';
import { RedisService } from '@midwayjs/redis';
import { JwtService } from '@midwayjs/jwt';
import { httpError } from '@midwayjs/core';

import * as bcrypt from 'bcryptjs';

import { TodoBoxService } from '@/service/todoBox.service';
import { SettingService } from '@/service/setting.service';

import { SettingInfo } from '@/entity/setting';
import { User } from '@/entity/user';
import { FolderInfo } from '@/entity/todoBox/folder';

import {
  UserDTO,
  UpdatePasswordDTO,
  UserByCodeDTO,
  LoginDTO,
  RefreshTokenDTO,
  UserInfoUpdateDTO,
} from '@/dto/user/index';

import {
  getAccessRefreshToken,
  getHeaderAuthInfo,
  getRandomCode,
  setRedisInfo,
} from '@/utils';
import { Sms } from '@/utils/Sms';
import { DefaultError } from '@/error/default.error';

import {
  SmsTemplateIdEnum,
  UserKeyEnum,
  UserLockEnum,
} from '@/types/user/enum';
import type { TokenPayloadType } from '@/types/user';
import { StartWeekEnum, WeekNameEnum } from '@/types/setting/enum';

const BCRYPT_SALT_ROUNDS = 10;

@Provide()
export class UserService {
  @InjectEntityModel(User)
  userModel: Repository<User>;

  @InjectEntityModel(FolderInfo)
  folderModel: Repository<FolderInfo>;

  @InjectEntityModel(SettingInfo)
  settingModel: Repository<SettingInfo>;

  @Config('jwt')
  jwtConfig;

  @Inject()
  redisService: RedisService;

  @Inject()
  jwtService: JwtService;

  @Inject()
  todoBoxService: TodoBoxService;

  @Inject()
  settingService: SettingService;

  @Inject()
  ctx: Context;

  async register(user: UserDTO) {
    const { mobile, code, password } = user;

    const findUser = await this.userModel.findOne({ where: { mobile } });
    if (!findUser) {
      const redisCode = await this.redisService.get(
        `${UserKeyEnum.SMS_REDIS_KEY}${mobile}`
      );

      if (redisCode === code) {
        const createUser = await this.userModel.create({
          username: `user_${getRandomCode()}`,
          password: bcrypt.hashSync(password, Number(BCRYPT_SALT_ROUNDS)),
          mobile,
        });
        const userInfo = await this.userModel.save(createUser);
        // 初始化默认todo 箱
        await this.folderModel.save({
          name: 'todo箱',
          userId: userInfo.id,
          todoList: [],
          sortIndex: 1,
        });
        // 初始化setting
        await this.settingModel.save({
          userId: userInfo.id,
          startWeek: StartWeekEnum.MONDAY,
          weekName: WeekNameEnum.WEEK,
        });
        return 'ok';
      }
      throw new DefaultError('验证码错误');
    }
    throw new DefaultError('该手机号已注册');
  }

  async loginByPassword(user: LoginDTO) {
    // 不需要做密码比对了，local.strategy 中已经做了
    const findUser = await this.userModel.findOne({
      where: {
        mobile: user.mobile,
      },
    });

    if (findUser.isLock === UserLockEnum.LOCK) {
      throw new DefaultError('该账号被锁，暂时无法登录');
    } else {
      const signPayload = {
        mobile: findUser.mobile,
        userId: findUser.id,
      };
      const tokenInfo = await getAccessRefreshToken(
        this.jwtService,
        signPayload,
        this.jwtConfig.expiresIn,
        this.jwtConfig.refreshExpiresIn
      );
      return {
        ...tokenInfo,
      };
    }
  }

  async loginByCode(user: UserByCodeDTO) {
    const { mobile, code } = user;
    const redisCode = await this.redisService.get(
      `${UserKeyEnum.SMS_REDIS_KEY}${mobile}`
    );
    if (redisCode === code) {
      const findUser = await this.userModel.findOne({
        where: {
          mobile: user.mobile,
        },
      });
      if (findUser) {
        if (findUser.isLock === UserLockEnum.LOCK) {
          throw new DefaultError('该账号被锁，暂时无法登录');
        } else {
          const signPayload = {
            mobile: findUser.mobile,
            userId: findUser.id,
          };
          const tokenInfo = await getAccessRefreshToken(
            this.jwtService,
            signPayload,
            this.jwtConfig.expiresIn,
            this.jwtConfig.refreshExpiresIn
          );

          return {
            userInfo: findUser,
            ...tokenInfo,
          };
        }
      }
      throw new DefaultError('该账号未注册');
    }
    throw new DefaultError('验证码错误');
  }

  async sendCode(mobile: string, type: keyof typeof SmsTemplateIdEnum) {
    const code = getRandomCode();
    try {
      const client = Sms.getInstance();
      await client.sendSms(mobile, code, SmsTemplateIdEnum[type]);

      const redisKey = `${UserKeyEnum.SMS_REDIS_KEY}${mobile}`;
      // 设置60秒有效期
      const isSave = await setRedisInfo(
        this.redisService,
        redisKey,
        code,
        'oneMinute'
      );
      if (!isSave) {
        this.ctx.logger.error(
          `redis验证码保存失败: redisKey: ${redisKey}, value: ${code}`
        );
        throw new DefaultError('验证码发送失败');
      }
      return '验证码发送成功';
    } catch (error) {
      this.ctx.logger.error('验证码发送失败', error);
      throw new DefaultError('验证码发送失败');
    }
  }

  async updatePassword(user: UpdatePasswordDTO) {
    const redisCode = await this.redisService.get(
      `${UserKeyEnum.SMS_REDIS_KEY}${user.mobile}`
    );
    if (redisCode === user.code) {
      const findUser = await this.userModel.findOne({
        where: {
          mobile: user.mobile,
        },
        select: ['password'],
      });
      const match = await bcrypt.compare(user.password, findUser.password);
      if (match) {
        await this.userModel.update(findUser, {
          password: bcrypt.hashSync(
            user.newPassword,
            Number(BCRYPT_SALT_ROUNDS)
          ),
        });
        return '修改成功';
      }
      throw new DefaultError('密码错误');
    }
    throw new DefaultError('验证码错误');
  }

  async changeMobile(user: UserByCodeDTO) {
    // 校验短信验证码
    const { mobile } = await getHeaderAuthInfo<TokenPayloadType>(
      this.jwtService,
      this.ctx.get('authorization')
    );
    const redisCode = await this.redisService.get(
      `${UserKeyEnum.SMS_REDIS_KEY}${mobile}`
    );
    if (redisCode === user.code) {
      const findUser = await this.userModel.findOne({
        where: { mobile },
      });
      await this.userModel.update(findUser, { mobile: user.mobile });
      return 'success';
    }
    throw new DefaultError('验证码错误');
  }

  async updateUserInfo(user: UserInfoUpdateDTO) {
    const { userId } = await getHeaderAuthInfo<TokenPayloadType>(
      this.jwtService,
      this.ctx.get('authorization')
    );
    const findUser = await this.userModel.findOneBy({ id: userId });
    if (findUser) {
      await this.userModel.update(userId, user);
      return 'ok';
    }
    throw new DefaultError('id 不合法');
  }
  async getUserInfo() {
    const { mobile } = await getHeaderAuthInfo<TokenPayloadType>(
      this.jwtService,
      this.ctx.get('authorization')
    );

    const findUser = await this.userModel.findOne({
      where: { mobile },
    });
    return findUser;
  }

  async forgetPassword(user: UserDTO) {
    const { mobile } = user;
    const redisCode = await this.redisService.get(
      `${UserKeyEnum.SMS_REDIS_KEY}${mobile}`
    );
    if (redisCode === user.code) {
      const findUser = await this.userModel.findOneBy({ mobile });
      if (findUser) {
        await this.userModel.update(findUser.id, {
          password: bcrypt.hashSync(user.password, Number(BCRYPT_SALT_ROUNDS)),
        });
        return 'ok';
      }
      throw new DefaultError('该用户未注册');
    }
    throw new DefaultError('验证码错误');
  }

  async handleRefreshToken(info: RefreshTokenDTO) {
    const { refreshToken } = info;
    try {
      await this.jwtService.verify(refreshToken, this.jwtConfig.secret);
      const { mobile, userId } = await getHeaderAuthInfo<TokenPayloadType>(
        this.jwtService,
        `Bearer ${refreshToken}`
      );
      return await getAccessRefreshToken(
        this.jwtService,
        { mobile, userId },
        this.jwtConfig.expiresIn,
        this.jwtConfig.refreshExpiresIn
      );
    } catch (error) {
      throw new httpError.ForbiddenError('无权限访问');
    }
  }
}
