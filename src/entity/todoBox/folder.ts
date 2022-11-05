import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '@/entity/user';
import { TodoInfo } from '@/entity/todoBox/todo';

@Entity()
export class FolderInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 20,
    comment: '文件夹名称',
  })
  name: string;

  @ManyToOne(() => User, user => user.folderInfo)
  @JoinColumn({
    name: 'user_id',
  })
  userId: number;

  @OneToMany(() => TodoInfo, todoInfo => todoInfo.folderId, {
    cascade: true,
  })
  @JoinColumn({
    name: 'todo_list',
  })
  todoList: TodoInfo[];

  @Column({ name: 'sort_index', comment: '展示顺序' })
  sortIndex: number;

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
