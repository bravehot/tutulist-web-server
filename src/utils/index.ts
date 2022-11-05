import * as dayjs from 'dayjs';

import type { JwtService } from '@midwayjs/jwt';
import type { RedisService } from '@midwayjs/redis';

export type RedisExpireType = {
  oneMinute: number;
  onDay: number;
  twoDay: number;
  endDay: number;
};

/**
 * 生成 4 位随机验证码
 * @returns string
 */
const getRandomCode = (): string => {
  const max = 9999;
  const min = 1234;
  const code = Math.floor(Math.random() * (max - min)) + min;
  return code.toString();
};

/**
 * 解析 token，解析其中的 payload
 * @param service
 * @param authorization
 * @returns
 */
const getHeaderAuthInfo = async <T>(
  service: JwtService,
  authorization: string
): Promise<T> => {
  const [, token] = authorization.trim().split(' ');
  const payload: any = await service.decode(token);
  return payload;
};

const getAccessRefreshToken = async (
  service: JwtService,
  payload: any,
  assetExpiresIn: string,
  refreshExpiresIn: string
): Promise<{
  accessToken: string;
  refreshToken: string;
}> => {
  const accessToken = await service.sign(payload, {
    expiresIn: assetExpiresIn,
  });
  const refreshToken = await service.sign(payload, {
    expiresIn: refreshExpiresIn,
  });

  return {
    accessToken,
    refreshToken,
  };
};

/**
 * Redis 的过期时间
 */
const getRedisExpireInfo = (): RedisExpireType => {
  const currentDay = dayjs().format('YYYY-MM-DD');
  return {
    oneMinute: 60,
    onDay: 60 * 60 * 24,
    twoDay: 60 * 60 * 24 * 2,
    // 距离当天的结束时间
    endDay: dayjs(`${currentDay} 23:59:59`).diff(dayjs(), 's'),
  };
};

const setRedisInfo = async (
  service: RedisService,
  key: string,
  value: string,
  expire: keyof RedisExpireType
): Promise<boolean> => {
  const expireInfo = getRedisExpireInfo();
  try {
    const isOk = await service.set(key, value, 'EX', expireInfo[expire]);
    return isOk === 'OK';
  } catch (error) {
    return false;
  }
};

export {
  getRandomCode,
  getHeaderAuthInfo,
  getRedisExpireInfo,
  setRedisInfo,
  getAccessRefreshToken,
};
