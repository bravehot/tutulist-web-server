import { PickDto, Rule, RuleType } from '@midwayjs/validate';
import joiDate from '@joi/date';

import { DoneEnum, PriorityEnum } from '@/types/calendar/enum';

export class EventInfoDTO {
  @Rule(RuleType.number())
  id: number;

  @Rule(
    RuleType.extend(joiDate)
      .date()
      .format('YYYY-MM-DD')
      .required()
      .error(new Error('startTime 日期格式为 YYYY-MM-DD'))
  )
  startTime: Date;

  @Rule(
    RuleType.extend(joiDate)
      .date()
      .format('YYYY-MM-DD')
      .required()
      .error(new Error('endTime 日期格式为 YYYY-MM-DD'))
  )
  endTime: Date;

  @Rule(
    RuleType.string()
      .max(20)
      .required()
      .error(new Error('title 字段限制 20 位以内字符'))
  )
  title: string;

  @Rule(
    RuleType.string()
      .max(200)
      .allow('')
      .required()
      .error(new Error('description 字段限制 200 位以内的字符'))
  )
  description: string;

  @Rule(RuleType.number().valid(DoneEnum.DONE, DoneEnum.UNDONE).required())
  isDone: DoneEnum;

  @Rule(
    RuleType.number()
      .valid(
        PriorityEnum.IMPORTANT_NOTURGENT,
        PriorityEnum.IMPORTANT_URGENT,
        PriorityEnum.UNIMPORTANT_NOTURGENT,
        PriorityEnum.UNIMPORTANT_URGENT
      )
      .required()
  )
  priority: PriorityEnum;
}

export class QueryEventListDTO extends PickDto(EventInfoDTO, [
  'startTime',
  'endTime',
]) {}

export class MoveFolderDTO {
  @Rule(RuleType.number().required())
  folderId: number;

  @Rule(RuleType.number().required())
  eventId: number;
}
