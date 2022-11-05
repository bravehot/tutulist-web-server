import { QueryMonthEnum } from '@/types/todoBox/enum';
import { DefaultError } from '@/error/default.error';
import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Context } from '@midwayjs/koa';
import { JwtService } from '@midwayjs/jwt';
import { TypeORMDataSourceManager } from '@midwayjs/typeorm';

import { getHeaderAuthInfo } from '@/utils';

import { FolderInfo } from '@/entity/todoBox/folder';
import { TodoInfo } from '@/entity/todoBox/todo';

import {
  CreateTodoFolderDTO,
  AddTodoDTO,
  UpdateTodoDTO,
  FolderIdDTO,
  TodoIdDTO,
  QueryMonthDTO,
  UpdateFolderDTO,
  SortFolderDTO,
  MoveTodoDTO,
} from '@/dto/todoBox/index';

import { TokenPayloadType } from '@/types/user';
import dayjs = require('dayjs');
import { EventInfo } from '@/entity/calendar/event';
import { DoneEnum } from '@/types/calendar/enum';

@Provide()
export class TodoBoxService {
  @InjectEntityModel(FolderInfo)
  folderModel: Repository<FolderInfo>;

  @InjectEntityModel(TodoInfo)
  todoModel: Repository<TodoInfo>;

  @InjectEntityModel(EventInfo)
  eventModel: Repository<EventInfo>;

  @Inject()
  dataSourceManager: TypeORMDataSourceManager;

  @Inject()
  ctx: Context;

  @Inject()
  jwtService: JwtService;

  async handleCreateFolder(folderInfo: CreateTodoFolderDTO) {
    const { userId } = await getHeaderAuthInfo<TokenPayloadType>(
      this.jwtService,
      this.ctx.get('authorization')
    );
    const folderAll = await this.folderModel.findBy({ userId });
    await this.folderModel.save({
      name: folderInfo.name,
      userId,
      todoList: [],
      sortIndex: folderAll.length + 1,
    });
    return await this.getFolderList();
  }

  async updateFolder(folderInfo: UpdateFolderDTO) {
    const { id: folderId, name } = folderInfo;
    const folder = await this.folderModel.findBy({ id: folderId });
    if (folder) {
      await this.folderModel.update(folderId, { name });
      return 'ok';
    }
    throw new DefaultError('id 不合法');
  }

  async handleSortFolder(folderInfo: SortFolderDTO) {
    const { moveIndex, sourceIndex, id } = folderInfo;

    const { userId } = await getHeaderAuthInfo<TokenPayloadType>(
      this.jwtService,
      this.ctx.get('authorization')
    );

    if (moveIndex === sourceIndex) {
      return this.getFolderList();
    }
    const isUp = sourceIndex > moveIndex;

    const startEndIndex = isUp
      ? {
          startIndex: moveIndex,
          endIndex: sourceIndex,
        }
      : {
          startIndex: sourceIndex,
          endIndex: moveIndex,
        };

    const dataSource = this.dataSourceManager.getDataSource('default');
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      // 开启事务
      await queryRunner.startTransaction();
      const folderList = await queryRunner.manager
        .createQueryBuilder(FolderInfo, 'folder')
        .where(
          'folder.userId = :userId AND folder.sortIndex BETWEEN :startIndex AND :endIndex',
          {
            userId,
            ...startEndIndex,
          }
        )
        .orderBy('sort_index', 'ASC')
        .getMany();
      for (let index = 0; index < folderList.length; index++) {
        const item = folderList[index];
        // 直接修改拖拽源的 sortIndex
        if (item.id === id) {
          await queryRunner.manager.update(FolderInfo, id, {
            sortIndex: moveIndex,
          });
        } else {
          await queryRunner.manager.update(FolderInfo, item.id, {
            sortIndex: isUp ? item.sortIndex + 1 : item.sortIndex - 1,
          });
        }
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    return this.getFolderList();
  }

  async getFolderList() {
    const { userId } = await getHeaderAuthInfo<TokenPayloadType>(
      this.jwtService,
      this.ctx.get('authorization')
    );

    return await this.folderModel
      .createQueryBuilder('folder')
      .where('folder.userId = :userId', { userId })
      .orderBy('sort_index', 'ASC')
      .getMany();
  }

  async removeFolder(folderInfo: FolderIdDTO) {
    const folder = await this.folderModel.findOne({
      where: [{ id: folderInfo.id }],
    });
    if (folder) {
      const dataSource = this.dataSourceManager.getDataSource('default');
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();

      try {
        // 开启事务
        await queryRunner.startTransaction();
        const folderList = await queryRunner.manager
          .createQueryBuilder(FolderInfo, 'folder')
          .where('folder.sortIndex > :sortIndex', {
            sortIndex: folder.sortIndex,
          })
          .orderBy('sort_index', 'ASC')
          .getMany();

        for (let index = 0; index < folderList.length; index++) {
          const item = folderList[index];
          await queryRunner.manager.update(FolderInfo, item.id, {
            sortIndex: item.sortIndex - 1,
          });
        }
        await this.folderModel.softRemove(folder);
        await queryRunner.commitTransaction();
        return 'ok';
      } catch (error) {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }
    }
    throw new DefaultError('id 不合法');
  }

  async getTodoList(queryInfo: QueryMonthDTO) {
    const { id, month } = queryInfo;

    // 获取所有
    if (month === QueryMonthEnum.MORE) {
      const folderInfo = await this.folderModel.findOne({
        where: [{ id: queryInfo.id }],
        relations: ['todoList'],
      });
      if (folderInfo) {
        return folderInfo.todoList;
      }
      throw new DefaultError('查询失败');
    } else {
      const endTime = dayjs().format('YYYY-MM-DD');
      const startTime = dayjs(endTime)
        .subtract(month, 'month')
        .format('YYYY-MM-DD');

      const folderInfo = await this.folderModel
        .createQueryBuilder('folder')
        .leftJoinAndSelect('folder.todoList', 'todo')
        .where('folder.id = :folderId AND todo.time BETWEEN :start AND :end', {
          folderId: id,
          start: startTime,
          end: endTime,
        })
        .getOne();

      if (folderInfo) {
        return folderInfo.todoList;
      }
      return [];
    }
  }

  async saveTodo(todoInfo: AddTodoDTO) {
    const folder = await this.folderModel.findOne({
      where: [
        {
          id: todoInfo.folderId,
        },
      ],
      relations: ['todoList'],
    });
    if (folder) {
      const { title, description, folderId, startTime, endTime, time } =
        todoInfo;
      const todoSave = await this.todoModel.save({
        time,
        startTime,
        endTime,
        title,
        description,
        folderId,
      });
      if (Array.isArray(folder.todoList)) {
        folder.todoList = [...folder.todoList, todoSave];
      } else {
        folder.todoList = [todoSave];
      }
      await this.folderModel.save(folder);

      return {
        id: todoSave.id,
        title: todoSave.title,
        description: todoSave.description,
        time: dayjs(todoSave.time).format('YYYY-MM-DD'),
      };
    }
    throw new DefaultError('创建失败,id 不合法');
  }

  async updateTodo(todoInfo: UpdateTodoDTO) {
    const { id, assignTime } = todoInfo;
    const todo = await this.todoModel.findOneBy({ id });
    if (!todo) {
      throw new DefaultError('id 不合法');
    }
    await this.todoModel.update(id, {
      title: todoInfo.title,
      description: todoInfo.description,
      priority: todoInfo.priority,
    });
    // 如果传了 assignTime，那么将该 todo 存入日历视角
    if (!assignTime) {
      return 'ok';
    }
    const { userId } = await getHeaderAuthInfo<TokenPayloadType>(
      this.jwtService,
      this.ctx.get('authorization')
    );
    const { title, description, priority } = todoInfo;
    await this.eventModel.save({
      userId,
      startTime: assignTime,
      endTime: assignTime,
      title,
      description,
      priority,
      isDone: DoneEnum.UNDONE,
    });
    await this.todoModel.delete({ id });
    return 'ok';
  }

  async removeTodo(todoInfo: TodoIdDTO) {
    const todo = await this.todoModel.findOne({ where: [{ id: todoInfo.id }] });
    if (todo) {
      await this.todoModel.softRemove(todo);
      return 'ok';
    }
    throw new DefaultError('id 不合法');
  }

  async moveTodo(moveInfo: MoveTodoDTO) {
    const { folderId, todoId } = moveInfo;
    const folderInfo = await this.folderModel.findOne({
      where: [{ id: folderId }],
      relations: ['todoList'],
    });

    if (!folderInfo) {
      throw new DefaultError('folderId 不合法');
    }
    const todoInfo = await this.todoModel.findBy({ id: todoId });
    if (!todoInfo) {
      throw new DefaultError('todoId 不合法');
    }

    await this.todoModel.update(todoId, {
      folderId,
    });
    return 'ok';
  }
}
