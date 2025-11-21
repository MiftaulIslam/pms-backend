import { randomUUID } from 'crypto';
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  Index,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { InviteStatus } from './invite-status.enum';
import { Workspace } from './workspace.entity';
import { User } from './user.entity';

@Entity('workspace_invitations')
@Index('uq_invite_token', ['token'], { unique: true })
export class WorkspaceInvitation {
  @PrimaryColumn('varchar', { length: 191 })
  id!: string;

  @Column('varchar', { length: 191 })
  workspaceId!: string;

  @Column('varchar', { length: 255 })
  email!: string;

  @Column('varchar', { length: 191 })
  invitedById!: string;

  @Column({ type: 'enum', enum: InviteStatus, default: InviteStatus.PENDING })
  status!: InviteStatus;

  @Column('varchar', { length: 191, unique: true })
  token!: string;

  @Column('datetime')
  expiresAt!: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @ManyToOne(() => Workspace, (w) => w.invitations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId', referencedColumnName: 'id' })
  workspace!: Workspace;

  @ManyToOne(() => User, (u) => u.invitations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invitedById', referencedColumnName: 'id' })
  invitedBy!: User;

  // Link to user by email (optional)
  @ManyToOne(() => User, (u) => u.workspaceInvitations, { nullable: true })
  @JoinColumn({ name: 'email', referencedColumnName: 'email' })
  inviteeEmail?: User | null;

  constructor() {
    if (!this.id) this.id = randomUUID();
  }
}
