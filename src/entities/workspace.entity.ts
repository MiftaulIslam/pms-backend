import { randomUUID } from 'crypto';
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { WorkspaceMember } from './workspace-member.entity';
import { WorkspaceInvitation } from './workspace-invitation.entity';

@Entity('workspaces')
export class Workspace {
  @PrimaryColumn('varchar', { length: 191 })
  id!: string;

  @Column('varchar', { length: 255 })
  name!: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @Column('varchar', { length: 191 })
  ownerId!: string;

  @ManyToOne(() => User, (u) => u.workspaces, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId', referencedColumnName: 'id' })
  owner!: User;

  @OneToMany(() => WorkspaceMember, (m) => m.workspace)
  members!: WorkspaceMember[];

  @OneToMany(() => WorkspaceInvitation, (i) => i.workspace)
  invitations!: WorkspaceInvitation[];

  constructor() {
    if (!this.id) this.id = randomUUID();
  }
}
