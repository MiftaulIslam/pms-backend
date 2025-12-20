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
import { Workspace } from './workspace.entity';
import { Folder } from './folder.entity';
import { Item } from './item.entity';
import { IconType } from './icon-type.enum';

@Entity('collections')
@Index('idx_collection_workspace', ['workspaceId'])
export class Collection {
  @PrimaryColumn('varchar', { length: 191 })
  id!: string;

  @Column('varchar', { length: 191 })
  workspaceId!: string;

  @Column('varchar', { length: 255 })
  name!: string;

  @Column('text', { nullable: true })
  description: string | null = null;
  @Column({
    type: 'enum',
    enum: IconType,
    default: IconType.SOLID,
  })
  iconType!: IconType;


  @Column('varchar', {
    length: 500,
    nullable: true,
    default: 'InboxStack',
  })
  icon!: string | null;
  
  @Column('varchar', {
    length: 500,
    nullable: true,
    default: '#60A5FA',
  })
  iconColor!: string | null;

  @Column('int', { default: 0 })
  position!: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @ManyToOne(() => Workspace, (w) => w.collections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId', referencedColumnName: 'id' })
  workspace!: Workspace;

  @OneToMany(() => Folder, (f) => f.collection)
  folders!: Folder[];

  @OneToMany(() => Item, (i) => i.collection)
  items!: Item[];

  constructor() {
    if (!this.id) this.id = randomUUID();
  }
}

