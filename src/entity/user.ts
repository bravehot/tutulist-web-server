import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { EventInfo } from '@/entity/calendar/event';
import { FolderInfo } from '@/entity/todoBox/folder';
import { SettingInfo } from '@/entity/setting/index';

import {
  UserCancelEnum,
  UserGenderEnum,
  UserLockEnum,
} from '@/types/user/enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 20,
  })
  username: string;

  @Column({ select: false })
  password: string;

  @Column({
    length: 11,
  })
  mobile: string;

  @Column({
    nullable: true,
  })
  avatar: string;

  @Column({
    type: 'enum',
    enum: UserGenderEnum,
    default: UserGenderEnum.SECRECY,
    comment: '0 男, 1 女, -1 保密',
  })
  gender: UserGenderEnum;

  @Column({
    type: 'tinyint',
    name: 'is_lock',
    default: UserLockEnum.UNLOCK,
    comment: '0 锁定 1账户未锁定',
  })
  isLock: UserLockEnum;

  @Column({
    type: 'tinyint',
    name: 'is_cancel',
    default: UserCancelEnum.NOT_CANCEL,
    comment: '0 注销, 1 账户未注销',
  })
  isCancel: UserCancelEnum;

  @OneToMany(() => EventInfo, eventInfo => eventInfo.userId, { cascade: true })
  eventInfo: EventInfo[];

  @OneToMany(() => FolderInfo, folderInfo => folderInfo.userId, {
    cascade: true,
  })
  folderInfo: FolderInfo[];

  @OneToOne(() => SettingInfo, settingInfo => settingInfo.userId, {
    cascade: true,
  })
  settingInfo: SettingInfo;

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
