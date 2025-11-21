import { randomUUID } from 'crypto';
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { Provider } from './provider.enum';
import { User } from './user.entity';

@Entity('accounts')
@Index('uq_provider_providerAccountId', ['provider', 'providerAccountId'], {
  unique: true,
})
export class Account {
  @PrimaryColumn('varchar', { length: 191 })
  id!: string;

  @Column({ type: 'enum', enum: Provider })
  provider!: Provider;

  @Column('varchar', { length: 191 })
  providerAccountId!: string;

  @Column('varchar', { length: 191 })
  userId!: string;

  @ManyToOne(() => User, (u) => u.accounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user!: User;

  @Column('varchar', { length: 500, nullable: true })
  access_token: string | null = null;

  @Column('bigint', { nullable: true })
  access_token_expires_at: number | null = null;

  @Column('varchar', { length: 500, nullable: true })
  refresh_token: string | null = null;

  @Column('bigint', { nullable: true })
  refresh_token_expires_at: number | null = null;

  constructor() {
    if (!this.id) this.id = randomUUID();
  }
}
