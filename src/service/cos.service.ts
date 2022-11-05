import { Config, Inject, Provide } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { JwtService } from '@midwayjs/jwt';
import * as STS from 'qcloud-cos-sts';

import { getHeaderAuthInfo } from '@/utils';
import { DefaultError } from '@/error/default.error';

import { TokenPayloadType } from '@/types/user';

@Provide()
export class CosService {
  @Config('cos.clients')
  cosConfig;

  @Inject()
  jwtService: JwtService;

  @Inject()
  ctx: Context;

  async getSTSConfig() {
    const { userId } = await getHeaderAuthInfo<TokenPayloadType>(
      this.jwtService,
      this.ctx.get('authorization')
    );
    const { SecretId, SecretKey, Bucket } = this.cosConfig.default;

    try {
      const result = await STS.getCredential({
        secretId: SecretId,
        secretKey: SecretKey,
        policy: {
          version: '2.0',
          statement: [
            {
              action: ['name/cos:PutObject'],
              effect: 'allow',
              resource: [
                `qcs::cos:ap-beijing:uid/1257872790:${Bucket}/web/avatar/${userId}/*`,
              ],
            },
          ],
        },
      });
      return result;
    } catch (error) {
      throw new DefaultError('生成 cos sts 失败');
    }
  }
}
