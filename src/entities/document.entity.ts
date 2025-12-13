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

@Entity('documents')
@Index('idx_document_item', ['itemId'], { unique: true })
export class Document {
  @PrimaryColumn('varchar', { length: 191 })
  id!: string;

  @Column('varchar', { length: 191, unique: true })
  itemId!: string;

  @Column('text', { nullable: true })
  content: string | null = null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @OneToOne(() => Item, (i) => i.document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itemId', referencedColumnName: 'id' })
  item!: Item;

  constructor() {
    if (!this.id) this.id = randomUUID();
  }
}

