import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { User } from './entities/user.entity';
import { Account } from './entities/account.entity';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { WorkspaceInvitation } from './entities/workspace-invitation.entity';
import { Collection } from './entities/collection.entity';
import { Folder } from './entities/folder.entity';
import { Item } from './entities/item.entity';
import { KanbanBoard } from './entities/kanban-board.entity';
import { KanbanColumn } from './entities/kanban-column.entity';
import { KanbanTask } from './entities/kanban-task.entity';
import { Document } from './entities/document.entity';
import { Whiteboard } from './entities/whiteboard.entity';
import { Image } from './entities/image.entity';
import { UsersModule } from './users/users.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { PlaygroundModule } from './playground/playground.module';
import { ImagesModule } from './images/images.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT || 3306),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        entities: [
          Account,
          User,
          Workspace,
          WorkspaceMember,
          WorkspaceInvitation,
          Collection,
          Folder,
          Item,
          KanbanBoard,
          KanbanColumn,
          KanbanTask,
          Document,
          Whiteboard,
          Image,
        ],
        synchronize: true,
        logging: true,
      }),
    }),
    TypeOrmModule.forFeature([
      Account,
      User,
      Workspace,
      WorkspaceMember,
      WorkspaceInvitation,
      Collection,
      Folder,
      Item,
      KanbanBoard,
      KanbanColumn,
      KanbanTask,
      Document,
      Whiteboard,
      Image,
    ]),
    AuthModule,
    UsersModule,
    WorkspacesModule,
    PlaygroundModule,
    ImagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
