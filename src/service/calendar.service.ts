import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, Between, Brackets, LessThan, MoreThan } from 'typeorm';
import { Context } from '@midwayjs/koa';
import { JwtService } from '@midwayjs/jwt';

import { EventInfo } from '@/entity/calendar/event';
import { FolderInfo } from '@/entity/todoBox/folder';
import { TodoInfo } from '@/entity/todoBox/todo';

import { MoveFolderDTO, EventInfoDTO, QueryEventListDTO } from '@/dto/calendar';

import { getHeaderAuthInfo } from '@/utils';
import { DefaultError } from './../error/default.error';

import type { TokenPayloadType } from '@/types/user';
import dayjs = require('dayjs');

@Provide()
export class CalendarService {
  @InjectEntityModel(EventInfo)
  eventModel: Repository<EventInfo>;

  @InjectEntityModel(FolderInfo)
  folderModel: Repository<FolderInfo>;

  @InjectEntityModel(TodoInfo)
  todoModel: Repository<TodoInfo>;

  @Inject()
  ctx: Context;

  @Inject()
  jwtService: JwtService;

  async handleUpdateEventInfo(eventInfo: EventInfoDTO) {
    try {
      await this.eventModel.update({ id: eventInfo.id }, eventInfo);
    } catch (error) {
      throw new DefaultError(error);
    }
    return 'ok';
  }

  async handleAddEventInfo(eventInfo: EventInfoDTO) {
    const { userId } = await getHeaderAuthInfo<TokenPayloadType>(
      this.jwtService,
      this.ctx.get('authorization')
    );

    const createEventInfo = await this.eventModel.create({
      ...eventInfo,
      userId,
    });
    const { id, isDone, startTime, endTime, title, description, priority } =
      await this.eventModel.save(createEventInfo);
    return {
      id,
      title,
      description,
      isDone,
      priority,
      startTime: dayjs(startTime).format('YYYY-MM-DD'),
      endTime: dayjs(endTime).format('YYYY-MM-DD'),
    };
  }

  async getEventList({ startTime, endTime }: QueryEventListDTO) {
    const { userId } = await getHeaderAuthInfo<TokenPayloadType>(
      this.jwtService,
      this.ctx.get('authorization')
    );
    const eventList = await this.eventModel
      .createQueryBuilder('eventInfo')
      .where('eventInfo.userId =:userId', { userId })
      .andWhere(
        new Brackets(qb => {
          qb.where({
            startTime: Between(startTime, endTime),
          })
            .orWhere({
              endTime: Between(startTime, endTime),
            })
            .orWhere({
              startTime: LessThan(startTime),
              endTime: MoreThan(endTime),
            });
        })
      )
      .getMany();
    return eventList;
  }

  async removeById(id: string) {
    const eventInfo = await this.eventModel.findOneBy({ id: Number(id) });
    if (eventInfo) {
      await this.eventModel.softRemove(eventInfo);
      return 'ok';
    }
    throw new DefaultError('id 不合法');
  }

  async moveFolder(moveInfo: MoveFolderDTO) {
    const { eventId, folderId } = moveInfo;
    const eventInfo = await this.eventModel.findOneBy({ id: eventId });

    if (!eventInfo) {
      throw new DefaultError('eventId 不合法');
    }

    const folderInfo = await this.folderModel.findOne({
      where: [
        {
          id: folderId,
        },
      ],
      relations: ['todoList'],
    });

    if (!folderInfo) {
      throw new DefaultError('folderId 不合法');
    }

    const { title, description, startTime, endTime, priority } = eventInfo;
    const saveTodo = await this.todoModel.save({
      time: dayjs().format('YYYY-MM-DD') as unknown as Date,
      title,
      description,
      startTime,
      endTime,
      priority,
    });

    if (Array.isArray(folderInfo.todoList)) {
      folderInfo.todoList = [...folderInfo.todoList, saveTodo];
    } else {
      folderInfo.todoList = [saveTodo];
    }

    await this.folderModel.save(folderInfo);
    await this.eventModel.delete(eventId);
    return 'ok';
  }
}
