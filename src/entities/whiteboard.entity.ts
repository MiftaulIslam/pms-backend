import { randomUUID } from 'crypto';
import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Item } from './item.entity';

@Entity('whiteboards')
@Index('idx_whiteboard_item', ['itemId'], { unique: true })
export class Whiteboard {
  @PrimaryColumn('varchar', { length: 191 })
  id!: string;

  @Column('varchar', { length: 191, unique: true })
  itemId!: string;

  @Column('json', { nullable: true })
  content: Record<string, any> | null = null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @OneToOne(() => Item, (i) => i.whiteboard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itemId', referencedColumnName: 'id' })
  item!: Item;

  constructor() {
    if (!this.id) this.id = randomUUID();
  }
}

