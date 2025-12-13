import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KanbanService } from './kanban.service';
import { KanbanController } from './kanban.controller';
import { KanbanBoard } from '../../entities/kanban-board.entity';
import { KanbanColumn } from '../../entities/kanban-column.entity';
import { KanbanTask } from '../../entities/kanban-task.entity';
import { Item } from '../../entities/item.entity';
import { Collection } from '../../entities/collection.entity';
import { Folder } from '../../entities/folder.entity';
import { Workspace } from '../../entities/workspace.entity';
import { WorkspaceMember } from '../../entities/workspace-member.entity';
import { Account } from 'src/entities/account.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KanbanBoard,
      KanbanColumn,
      KanbanTask,
      Account,
      Item,
      Collection,
      Folder,
      Workspace,
      WorkspaceMember,
    ]),
    AuthModule,
  ],
  controllers: [KanbanController],
  providers: [KanbanService],
  exports: [KanbanService],
})
export class KanbanModule {}

