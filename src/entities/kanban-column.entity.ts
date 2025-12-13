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
import { KanbanBoard } from './kanban-board.entity';
import { KanbanTask } from './kanban-task.entity';

@Entity('kanban_columns')
@Index('idx_kanban_column_board', ['kanbanBoardId'])
export class KanbanColumn {
  @PrimaryColumn('varchar', { length: 191 })
  id!: string;

  @Column('varchar', { length: 191 })
  kanbanBoardId!: string;

  @Column('varchar', { length: 255 })
  title!: string;

  @Column('int', { default: 0 })
  position!: number;

  @Column('varchar', { length: 50, nullable: true })
  color: string | null = null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @ManyToOne(() => KanbanBoard, (kb) => kb.columns, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'kanbanBoardId', referencedColumnName: 'id' })
  kanbanBoard!: KanbanBoard;

  @OneToMany(() => KanbanTask, (kt) => kt.kanbanColumn, { cascade: true })
  tasks!: KanbanTask[];

  constructor() {
    if (!this.id) this.id = randomUUID();
  }
}

