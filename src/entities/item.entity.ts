import { randomUUID } from 'crypto';
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Collection } from './collection.entity';
import { Folder } from './folder.entity';
import { ItemType } from './item-type.enum';
import { IconType } from './icon-type.enum';
import { KanbanBoard } from './kanban-board.entity';
import { Document } from './document.entity';
import { Whiteboard } from './whiteboard.entity';

@Entity('items')
@Index('idx_item_collection', ['collectionId'])
@Index('idx_item_folder', ['parentFolderId'])
@Index('idx_item_type', ['type'])
export class Item {
  @PrimaryColumn('varchar', { length: 191 })
  id!: string;

  @Column('varchar', { length: 191, nullable: true })
  collectionId: string | null = null;

  @Column('varchar', { length: 191, nullable: true })
  parentFolderId: string | null = null;

  @Column('varchar', { length: 255 })
  name!: string;

  @Column('text', { nullable: true })
  description: string | null = null;

  @Column({ type: 'enum', enum: ItemType })
  type!: ItemType;

  @Column('varchar', {
    length: 500,
    nullable: true,
  })
  icon!: string | null;
  
  @Column('varchar', {
    length: 500,
    nullable: true,
    default: '#60A5FA',
  })
  iconColor!: string | null;
  @Column({
    type: 'enum',
    enum: IconType,
    default: IconType.SOLID,
  })
  iconType!: IconType;


  @Column('int', { default: 0 })
  position!: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @ManyToOne(() => Collection, (c) => c.items, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'collectionId', referencedColumnName: 'id' })
  collection: Collection | null = null;

  @ManyToOne(() => Folder, (f) => f.items, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parentFolderId', referencedColumnName: 'id' })
  parentFolder: Folder | null = null;

  @OneToOne(() => KanbanBoard, (kb) => kb.item, { nullable: true })
  kanbanBoard: KanbanBoard | null = null;

  @OneToOne(() => Document, (d) => d.item, { nullable: true })
  document: Document | null = null;

  @OneToOne(() => Whiteboard, (w) => w.item, { nullable: true })
  whiteboard: Whiteboard | null = null;

  constructor() {
    if (!this.id) this.id = randomUUID();
  }
}

