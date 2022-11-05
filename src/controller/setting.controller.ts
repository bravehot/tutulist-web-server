import { Body, Controller, Get, Inject, Post } from '@midwayjs/decorator';
import { Validate } from '@midwayjs/validate';

import { SettingService } from '@/service/setting.service';

import { SaveSettingDTO } from '@/dto/setting';

@Controller('/setting')
export class Setting {
  @Inject()
  settingService: SettingService;

  @Post('/save')
  @Validate()
  async handleSaveSetting(@Body() settingInfo: SaveSettingDTO) {
    return await this.settingService.saveSetting(settingInfo);
  }

  @Get('/userSetting')
  async getSettingInfo() {
    return await this.settingService.getSettingInfo();
  }
}
