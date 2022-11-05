import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { DoneEnum, PriorityEnum } from '@/types/calendar/enum';

import { User } from '@/entity/user';

@Entity()
export class EventInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 20,
  })
  title: string;

  @Column({
    length: 100,
  })
  description: string;

  @Column({
    type: 'tinyint',
    name: 'is_done',
    default: DoneEnum.UNDONE,
    comment: '0 未完成 1 已完成',
  })
  isDone: DoneEnum;

  @Column({
    type: 'enum',
    enum: PriorityEnum,
    default: PriorityEnum.UNIMPORTANT_NOTURGENT,
    comment: '事件优先级',
  })
  priority: PriorityEnum;

  @Column('date', {
    name: 'start_time',
  })
  startTime: Date;

  @Column('date', {
    name: 'end_time',
  })
  endTime: Date;

  @ManyToOne(() => User, user => user.eventInfo)
  @JoinColumn({
    name: 'user_id',
  })
  userId: number;

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
