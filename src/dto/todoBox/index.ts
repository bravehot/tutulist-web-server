import { OmitDto, Rule, RuleType } from '@midwayjs/validate';
import joiDate from '@joi/date';

import { PriorityEnum } from '@/types/calendar/enum';
import { QueryMonthEnum } from '@/types/todoBox/enum';
export class CreateTodoFolderDTO {
  @Rule(
    RuleType.string()
      .max(20)
      .required()
      .error(new Error('name 字段限制 20 位以内字符'))
  )
  name: string;
}

export class FolderIdDTO {
  @Rule(RuleType.number())
  id: number;
}

export class UpdateFolderDTO extends CreateTodoFolderDTO {
  @Rule(RuleType.number())
  id: number;
}

export class SortFolderDTO {
  @Rule(RuleType.number().required())
  moveIndex: number;

  @Rule(RuleType.number().required())
  sourceIndex: number;

  @Rule(RuleType.number())
  id: number;
}

export class QueryMonthDTO extends FolderIdDTO {
  @Rule(
    RuleType.number()
      .valid(
        QueryMonthEnum.ONE_MONTH,
        QueryMonthEnum.THREE_MONTH,
        QueryMonthEnum.HALF_YEAR,
        QueryMonthEnum.ONE_YEAR,
        QueryMonthEnum.MORE
      )
      .required()
  )
  month: QueryMonthEnum;
}

export class AddTodoDTO {
  @Rule(RuleType.number().required())
  folderId: number;

  @Rule(
    RuleType.extend(joiDate)
      .date()
      .format('YYYY-MM-DD')
      .allow(null)
      .error(new Error('startTime 日期格式为 YYYY-MM-DD'))
  )
  startTime: Date;

  @Rule(
    RuleType.extend(joiDate)
      .date()
      .format('YYYY-MM-DD')
      .allow(null)
      .error(new Error('endTime 日期格式为 YYYY-MM-DD'))
  )
  endTime: Date;

  @Rule(
    RuleType.extend(joiDate)
      .date()
      .format('YYYY-MM-DD')
      .error(new Error('time 日期格式为 YYYY-MM-DD'))
  )
  time: Date;

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
      .error(new Error('description 字段限制 200 位以内的字符'))
  )
  description: string;

  @Rule(
    RuleType.number().valid(
      PriorityEnum.IMPORTANT_NOTURGENT,
      PriorityEnum.IMPORTANT_URGENT,
      PriorityEnum.UNIMPORTANT_NOTURGENT,
      PriorityEnum.UNIMPORTANT_URGENT
    )
  )
  priority: PriorityEnum;
}

export class TodoIdDTO extends FolderIdDTO {}

export class UpdateTodoDTO extends OmitDto(AddTodoDTO, ['folderId']) {
  @Rule(RuleType.number())
  id: number;

  @Rule(RuleType.string().allow(''))
  assignTime: string;
}

export class MoveTodoDTO {
  @Rule(RuleType.number().required())
  folderId: number;

  @Rule(RuleType.number().required())
  todoId: number;
}
