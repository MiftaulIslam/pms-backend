import { randomUUID } from 'crypto';
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Item } from './item.entity';
import { KanbanColumn } from './kanban-column.entity';

@Entity('kanban_boards')
@Index('idx_kanban_board_item', ['itemId'], { unique: true })
export class KanbanBoard {
  @PrimaryColumn('varchar', { length: 191 })
  id!: string;

  @Column('varchar', { length: 191, unique: true })
  itemId!: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @OneToOne(() => Item, (i) => i.kanbanBoard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itemId', referencedColumnName: 'id' })
  item!: Item;

  @OneToMany(() => KanbanColumn, (kc) => kc.kanbanBoard, { cascade: true })
  columns!: KanbanColumn[];

  constructor() {
    if (!this.id) this.id = randomUUID();
  }
}

