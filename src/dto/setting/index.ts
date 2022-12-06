import { StartWeekEnum, ThemeEnum, WeekNameEnum } from '@/types/setting/enum';
import { Rule, RuleType } from '@midwayjs/validate';

export class SaveSettingDTO {
  @Rule(
    RuleType.string()
      .valid(StartWeekEnum.MONDAY, StartWeekEnum.SUNDAY)
      .required()
  )
  startWeek: StartWeekEnum;

  @Rule(
    RuleType.string()
      .valid(WeekNameEnum.STAR_WEEK, WeekNameEnum.WEEK)
      .required()
  )
  weekName: WeekNameEnum;

  @Rule(
    RuleType.string()
      .valid(ThemeEnum.DARK, ThemeEnum.LIGHT, ThemeEnum.SYSTEM)
      .required()
  )
  theme: ThemeEnum;
}
