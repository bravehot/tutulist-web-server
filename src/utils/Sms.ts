import { Context } from '@midwayjs/koa';
import { Inject } from '@midwayjs/decorator';
import * as tencentcloud from 'tencentcloud-sdk-nodejs';
import { DefaultError } from '@/error/default.error';

import SMSKEY from './key';
export class Sms {
  @Inject()
  ctx: Context;

  private static instance: Sms;

  private smsClient: any;

  private constructor() {
    const SmsClient = tencentcloud.sms.v20210111.Client;
    this.smsClient = new SmsClient({
      credential: {
        secretId: SMSKEY.SMS_SECRET_ID,
        secretKey: SMSKEY.SMS_SECRET_KEY,
      },
      region: 'ap-guangzhou',
      profile: {
        httpProfile: {
          endpoint: 'sms.tencentcloudapi.com',
        },
      },
    });
  }

  public static getInstance() {
    if (!Sms.instance) {
      Sms.instance = new Sms();
    }
    return Sms.instance;
  }
  /**
   * @param mobile 手机号
   * @param code 验证码
   * @param templateId 腾讯云对应的短信模版 id
   */
  async sendSms(mobile: string, code: string, templateId: string) {
    const params = {
      SmsSdkAppId: SMSKEY.SMS_SDK_APP_ID,
      SignName: SMSKEY.SMS_SIGN_NAME,
      TemplateId: templateId,
      PhoneNumberSet: [mobile],
      TemplateParamSet: [code],
    };
    /**
     * 调用是会消耗短信额度的，建议调通之后，就把下面代码注释掉，直接返回 true 发送成功
     * 需要登录的时候直接去 Redis 取
     */
    try {
      const smsClient = Sms.getInstance().smsClient;
      const { SendStatusSet } = await smsClient.SendSms(params);
      const smsResult = SendStatusSet && SendStatusSet[0];
      if (smsResult.Code === 'Ok') {
        return true;
      } else {
        this.ctx.logger.error(
          '$s %j',
          `腾讯云sms发送失败, ${smsResult.Code}`,
          params
        );
        throw new DefaultError(smsResult.Code);
      }
    } catch (error) {
      throw new DefaultError(JSON.stringify(error));
    }
  }
}
