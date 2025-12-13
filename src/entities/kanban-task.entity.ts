import { randomUUID } from 'crypto';
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { KanbanColumn } from './kanban-column.entity';
import { User } from './user.entity';
import { Priority } from './priority.enum';

@Entity('kanban_tasks')
@Index('idx_kanban_task_column', ['kanbanColumnId'])
@Index('idx_kanban_task_parent', ['parentTaskId'])
export class KanbanTask {
  @PrimaryColumn('varchar', { length: 191 })
  id!: string;

  @Column('varchar', { length: 191 })
  kanbanColumnId!: string;

  @Column('varchar', { length: 500 })
  title!: string;

  @Column('text', { nullable: true })
  description: string | null = null;

  @Column({ type: 'enum', enum: Priority, nullable: true })
  priority: Priority | null = null;

  @Column('varchar', { length: 191, nullable: true })
  assigneeId: string | null = null;

  @Column('datetime', { nullable: true })
  dueDate: Date | null = null;

  @Column('int', { default: 0 })
  position!: number;

  @Column('varchar', { length: 191, nullable: true })
  parentTaskId: string | null = null;

  @Column({ type: 'boolean', default: false })
  done: boolean = false;

  @Column({ type: 'boolean', default: false })
  isParent: boolean = false;

  @Column('json', { nullable: true })
  tags: string[] | null = null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @ManyToOne(() => KanbanColumn, (kc) => kc.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'kanbanColumnId', referencedColumnName: 'id' })
  kanbanColumn!: KanbanColumn;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigneeId', referencedColumnName: 'id' })
  assignee: User | null = null;

  @ManyToOne(() => KanbanTask, (kt) => kt.subtasks, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentTaskId', referencedColumnName: 'id' })
  parentTask: KanbanTask | null = null;

  @OneToMany(() => KanbanTask, (kt) => kt.parentTask)
  subtasks!: KanbanTask[];

  constructor() {
    if (!this.id) this.id = randomUUID();
  }
}

