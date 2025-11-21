import { randomUUID } from 'crypto';
import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WorkspaceInvitation } from './workspace-invitation.entity';
import { WorkspaceMember } from './workspace-member.entity';
import { Workspace } from './workspace.entity';
import { Account } from './account.entity';

@Entity('users')
export class User {
  @PrimaryColumn('varchar', { length: 191 })
  id!: string;

  @Column('varchar', { length: 255, nullable: true })
  name: string | null = null;

  @Column('varchar', { length: 255, unique: true, nullable: true })
  email: string | null = null;

  @Column('varchar', { length: 500, nullable: true })
  avatar: string | null = null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @Column({ type: 'boolean', default: false })
  onboarded: boolean = false;

  @Column('varchar', { length: 255, nullable: true })
  heardAboutUs: string | null = null;

  @Column({ type: 'json', nullable: true })
  interestIn: string[] | null = null;

  @OneToMany(() => Account, (a) => a.user)
  accounts!: Account[];

  @OneToMany(() => Workspace, (w) => w.owner)
  workspaces!: Workspace[];

  @OneToMany(() => WorkspaceMember, (m) => m.user)
  memberships!: WorkspaceMember[];

  @OneToMany(() => WorkspaceInvitation, (i) => i.invitedBy)
  invitations!: WorkspaceInvitation[];

  @OneToMany(() => WorkspaceInvitation, (i) => i.inviteeEmail)
  workspaceInvitations!: WorkspaceInvitation[];

  constructor() {
    if (!this.id) this.id = randomUUID();
  }
}
