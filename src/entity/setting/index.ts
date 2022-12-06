import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { StartWeekEnum, WeekNameEnum, ThemeEnum } from '@/types/setting/enum';
@Entity()
export class SettingInfo {
  @PrimaryColumn()
  @JoinColumn({
    name: 'user_id',
  })
  userId: number;

  @Column({
    type: 'enum',
    enum: StartWeekEnum,
    name: 'start_week',
    default: StartWeekEnum.MONDAY,
    comment: '起始周设置',
  })
  startWeek: StartWeekEnum;

  @Column({
    type: 'enum',
    enum: WeekNameEnum,
    name: 'week_name',
    default: WeekNameEnum.STAR_WEEK,
    comment: '周命名为星期还是周',
  })
  weekName: WeekNameEnum;

  @Column({
    type: 'enum',
    enum: ThemeEnum,
    default: ThemeEnum.SYSTEM,
    comment: '设置系统主题，默认是跟随系统',
  })
  theme: ThemeEnum;

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
