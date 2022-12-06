import { Inject, Provide } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@midwayjs/jwt';

import { SettingInfo } from '@/entity/setting';
import { SaveSettingDTO } from '@/dto/setting/index';

import { getHeaderAuthInfo } from '@/utils';

import { TokenPayloadType } from '@/types/user';

@Provide()
export class SettingService {
  @InjectEntityModel(SettingInfo)
  settingModel: Repository<SettingInfo>;

  @Inject()
  jwtService: JwtService;

  @Inject()
  ctx: Context;

  async saveSetting(settingInfo: SaveSettingDTO) {
    const { userId } = await getHeaderAuthInfo<TokenPayloadType>(
      this.jwtService,
      this.ctx.get('authorization')
    );

    const setting = await this.settingModel.findOneBy({ userId });
    if (setting) {
      await this.settingModel.update(userId, settingInfo);
      return 'ok';
    } else {
      const { startWeek, weekName, theme } = settingInfo;
      const setting = await this.settingModel.create({
        userId,
        startWeek,
        weekName,
        theme,
      });
      await this.settingModel.save(setting);
      return 'ok';
    }
  }

  async getSettingInfo() {
    const { userId } = await getHeaderAuthInfo<TokenPayloadType>(
      this.jwtService,
      this.ctx.get('authorization')
    );
    const settingInfo = await this.settingModel.findOne({
      where: [{ userId }],
    });
    if (settingInfo) {
      const { startWeek, weekName, theme } = settingInfo;
      return {
        startWeek,
        weekName,
        theme,
      };
    }
    return [];
  }
}
