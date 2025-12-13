import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaygroundService } from './playground.service';
import { PlaygroundController } from './playground.controller';
import { Collection } from '../entities/collection.entity';
import { Folder } from '../entities/folder.entity';
import { Item } from '../entities/item.entity';
import { Workspace } from '../entities/workspace.entity';
import { WorkspaceMember } from '../entities/workspace-member.entity';
import { KanbanBoard } from '../entities/kanban-board.entity';
import { KanbanColumn } from '../entities/kanban-column.entity';
import { KanbanTask } from '../entities/kanban-task.entity';
import { KanbanModule } from './kanban/kanban.module';
import { Account } from 'src/entities/account.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Collection,
      Folder,
      Item,
      Workspace,
      WorkspaceMember,
      KanbanBoard,
      KanbanColumn,
      KanbanTask,
      Account,
    ]),
    AuthModule,
    KanbanModule,
  ],
  controllers: [PlaygroundController],
  providers: [PlaygroundService],
  exports: [PlaygroundService],
})
export class PlaygroundModule {}

