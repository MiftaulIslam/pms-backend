import { randomUUID } from 'crypto';
import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('images')
export class Image {
    @PrimaryColumn('varchar', { length: 191 })
    id!: string;

    @Column('varchar', { length: 255 })
    name!: string;

    @Column('varchar', { length: 500 })
    filename!: string;

    @Column('varchar', { length: 500 })
    url!: string;

    @Column('varchar', { length: 191, nullable: true })
    userId: string | null = null;

    @Column('varchar', { length: 191, nullable: true })
    workspaceId: string | null = null;

    @Column('varchar', { length: 191, nullable: true })
    collectionId: string | null = null;

    @Column('varchar', { length: 191, nullable: true })
    folderId: string | null = null;

    @Column('varchar', { length: 191, nullable: true })
    itemId: string | null = null;

    @CreateDateColumn({ type: 'datetime' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'datetime' })
    updatedAt!: Date;

    constructor() {
        if (!this.id) this.id = randomUUID();
    }
}

