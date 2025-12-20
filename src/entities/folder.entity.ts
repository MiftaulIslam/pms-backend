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
import { Collection } from './collection.entity';
import { Item } from './item.entity';
import { IconType } from './icon-type.enum';

@Entity('folders')
@Index('idx_folder_collection', ['collectionId'])
@Index('idx_folder_parent', ['parentFolderId'])
export class Folder {
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

  @Column('varchar', {
    length: 500,
    nullable: true,
    default: 'Folder',
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

  @ManyToOne(() => Collection, (c) => c.folders, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'collectionId', referencedColumnName: 'id' })
  collection: Collection | null = null;

  @ManyToOne(() => Folder, (f) => f.childFolders, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parentFolderId', referencedColumnName: 'id' })
  parentFolder: Folder | null = null;

  @OneToMany(() => Folder, (f) => f.parentFolder)
  childFolders!: Folder[];

  @OneToMany(() => Item, (i) => i.parentFolder)
  items!: Item[];

  constructor() {
    if (!this.id) this.id = randomUUID();
  }
}

