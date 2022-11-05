// 每一个 todoList 中存放的 todo
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import { FolderInfo } from '@/entity/todoBox/folder';

import { PriorityEnum } from '@/types/calendar/enum';

@Entity()
export class TodoInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', name: 'start_time', default: null })
  startTime: Date;

  @Column({ type: 'date', name: 'end_time', default: null })
  endTime: Date;

  @Column({ type: 'date' })
  time: Date;

  @Column({
    length: 20,
  })
  title: string;

  @Column({
    length: 100,
    default: '',
  })
  description: string;

  @ManyToOne(() => FolderInfo, folder => folder.todoList)
  @JoinColumn({
    name: 'folder_id',
  })
  folderId: number;

  @Column({
    type: 'enum',
    enum: PriorityEnum,
    default: PriorityEnum.UNIMPORTANT_NOTURGENT,
    comment: '事件优先级',
  })
  priority: PriorityEnum;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'create_time',
    select: false,
  })
  createTime: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'update_time',
    select: false,
  })
  updateTime: Date;

  @DeleteDateColumn({
    type: 'timestamp',
    name: 'delete_time',
    select: false,
  })
  deleteTime: Date;
}
