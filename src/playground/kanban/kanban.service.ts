import { Injectable, NotFoundException, ForbiddenException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { KanbanBoard } from '../../entities/kanban-board.entity';
import { KanbanColumn } from '../../entities/kanban-column.entity';
import { KanbanTask } from '../../entities/kanban-task.entity';
import { Item } from '../../entities/item.entity';
import { ItemType } from '../../entities/item-type.enum';
import { Collection } from '../../entities/collection.entity';
import { Folder } from '../../entities/folder.entity';
import { Workspace } from '../../entities/workspace.entity';
import { WorkspaceMember } from '../../entities/workspace-member.entity';
import { CreateColumnDto } from './dto/create-column.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';

@Injectable()
export class KanbanService {
    constructor(
        @InjectRepository(KanbanBoard)
        private readonly kanbanBoardsRepository: Repository<KanbanBoard>,
        @InjectRepository(KanbanColumn)
        private readonly kanbanColumnsRepository: Repository<KanbanColumn>,
        @InjectRepository(KanbanTask)
        private readonly kanbanTasksRepository: Repository<KanbanTask>,
        @InjectRepository(Item)
        private readonly itemsRepository: Repository<Item>,
        @InjectRepository(Collection)
        private readonly collectionsRepository: Repository<Collection>,
        @InjectRepository(Folder)
        private readonly foldersRepository: Repository<Folder>,
        @InjectRepository(Workspace)
        private readonly workspacesRepository: Repository<Workspace>,
        @InjectRepository(WorkspaceMember)
        private readonly workspaceMembersRepository: Repository<WorkspaceMember>,
    ) { }

    private readonly logger = new Logger(KanbanService.name);

    // Helper: Verify workspace access via item
    private async verifyItemAccess(itemId: string, userId: string): Promise<string> {
        const item = await this.itemsRepository.findOne({
            where: { id: itemId },
            relations: ['collection', 'parentFolder'],
        });

        if (!item) {
            throw new NotFoundException('Item not found');
        }

        if (item.type !== ItemType.LIST) {
            throw new BadRequestException('Item is not a list type');
        }

        let workspaceId: string;
        if (item.collectionId) {
            const collection = await this.collectionsRepository.findOne({
                where: { id: item.collectionId },
            });
            if (!collection) {
                throw new NotFoundException('Collection not found');
            }
            workspaceId = collection.workspaceId;
        } else if (item.parentFolderId) {
            let currentFolderId: string | null = item.parentFolderId;
            while (currentFolderId) {
                const folder = await this.foldersRepository.findOne({
                    where: { id: currentFolderId },
                    relations: ['collection'],
                });
                if (folder?.collectionId) {
                    const collection = await this.collectionsRepository.findOne({
                        where: { id: folder.collectionId },
                    });
                    workspaceId = collection!.workspaceId;
                    break;
                }
                currentFolderId = folder?.parentFolderId || null;
            }
            if (!workspaceId!) {
                throw new NotFoundException('Could not determine workspace');
            }
        } else {
            throw new NotFoundException('Item has no parent');
        }

        const workspace = await this.workspacesRepository.findOne({
            where: { id: workspaceId },
        });

        if (!workspace) {
            throw new NotFoundException('Workspace not found');
        }

        if (workspace.ownerId !== userId) {
            const membership = await this.workspaceMembersRepository.findOne({
                where: { workspaceId, userId },
            });
            if (!membership) {
                throw new ForbiddenException('Access denied');
            }
        }

        return workspaceId;
    }

    // Helper: Get max position
    private async getMaxPosition(
        repository: Repository<KanbanColumn | KanbanTask>,
        where: any,
    ): Promise<number> {
        const result = await repository.findOne({
            where,
            order: { position: 'DESC' },
            select: ['position'],
        });
        return result ? result.position + 1 : 0;
    }

    async createKanbanBoard(itemId: string, userId: string) {
        await this.verifyItemAccess(itemId, userId);

        const existingBoard = await this.kanbanBoardsRepository.findOne({
            where: { itemId },
        });

        if (existingBoard) {
            throw new BadRequestException('Kanban board already exists for this item');
        }

        const board = this.kanbanBoardsRepository.create({
            itemId,
        });

        return await this.kanbanBoardsRepository.save(board);
    }

    async getKanbanBoard(itemId: string, userId: string) {
        await this.verifyItemAccess(itemId, userId);

        const board = await this.kanbanBoardsRepository.findOne({
            where: { itemId },
            relations: ['columns', 'columns.tasks', 'columns.tasks.assignee', 'columns.tasks.subtasks', 'columns.tasks.subtasks.assignee'],
        });

        if (!board) {
            throw new NotFoundException('Kanban board not found');
        }

        // Sort columns and tasks by position
        board.columns.sort((a, b) => a.position - b.position);
        board.columns.forEach((col) => {
            col.tasks.sort((a, b) => a.position - b.position);
            // Sort subtasks by position
            col.tasks.forEach((task) => {
                if (task.subtasks && task.subtasks.length > 0) {
                    task.subtasks.sort((a, b) => a.position - b.position);
                }
            });
        });

        // Transform to match frontend structure
        return {
            id: board.id,
            itemId: board.itemId,
            columns: board.columns.map((col) => ({
                id: col.id,
                title: col.title,
                color: col.color,
                position: col.position,
                cards: col.tasks
                    .filter((task) => !task.parentTaskId) // Only top-level tasks
                    .map((task) => this.transformTask(task, col.tasks)),
            })),
            createdAt: board.createdAt,
            updatedAt: board.updatedAt,
        };
    }

    private transformTask(task: KanbanTask, allTasks: KanbanTask[]): any {
        const subtasks = allTasks.filter((t) => t.parentTaskId === task.id);
        const hasSubtasks = subtasks.length > 0;

        return {
            id: task.id,
            title: task.title,
            description: task.description || undefined,
            priority: task.priority || undefined,
            assignee: task.assignee?.name || undefined,
            assigneeId: task.assigneeId || undefined,
            tags: task.tags || [],
            dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
            parentId: task.parentTaskId || null,
            isParent: hasSubtasks || task.isParent,
            done: task.done,
            subtasks: subtasks.map((st) => this.transformTask(st, allTasks)),
        };
    }

    async createColumn(createColumnDto: CreateColumnDto, userId: string) {
        const board = await this.kanbanBoardsRepository.findOne({
            where: { id: createColumnDto.kanbanBoardId },
            relations: ['item'],
        });

        if (!board) {
            throw new NotFoundException('Kanban board not found');
        }

        await this.verifyItemAccess(board.itemId, userId);

        const maxPosition = await this.getMaxPosition(this.kanbanColumnsRepository, {
            kanbanBoardId: createColumnDto.kanbanBoardId,
        });

        const column = this.kanbanColumnsRepository.create({
            ...createColumnDto,
            position: maxPosition,
        });

        return await this.kanbanColumnsRepository.save(column);
    }

    async updateColumn(id: string, updateData: Partial<CreateColumnDto>, userId: string) {
        const column = await this.kanbanColumnsRepository.findOne({
            where: { id },
            relations: ['kanbanBoard', 'kanbanBoard.item'],
        });

        if (!column) {
            throw new NotFoundException('Column not found');
        }

        await this.verifyItemAccess(column.kanbanBoard.itemId, userId);

        await this.kanbanColumnsRepository.update(id, updateData);
        return await this.kanbanColumnsRepository.findOne({
            where: { id },
            relations: ['tasks'],
        });
    }

    async deleteColumn(id: string, userId: string) {
        const column = await this.kanbanColumnsRepository.findOne({
            where: { id },
            relations: ['kanbanBoard', 'kanbanBoard.item'],
        });

        if (!column) {
            throw new NotFoundException('Column not found');
        }

        await this.verifyItemAccess(column.kanbanBoard.itemId, userId);

        await this.kanbanColumnsRepository.delete(id);
        return { message: 'Column deleted successfully' };
    }

    async createTask(createTaskDto: CreateTaskDto, userId: string) {
        const column = await this.kanbanColumnsRepository.findOne({
            where: { id: createTaskDto.kanbanColumnId },
            relations: ['kanbanBoard', 'kanbanBoard.item'],
        });

        if (!column) {
            throw new NotFoundException('Column not found');
        }

        await this.verifyItemAccess(column.kanbanBoard.itemId, userId);

        const where = createTaskDto.parentTaskId
            ? {
                kanbanColumnId: createTaskDto.kanbanColumnId,
                parentTaskId: createTaskDto.parentTaskId,
            }
            : {
                kanbanColumnId: createTaskDto.kanbanColumnId,
                parentTaskId: IsNull(),
            };

        const maxPosition = await this.getMaxPosition(this.kanbanTasksRepository, where);

        const task = this.kanbanTasksRepository.create({
            ...createTaskDto,
            position: maxPosition,
            done: createTaskDto.done ?? false,
            isParent: createTaskDto.isParent ?? false,
            tags: createTaskDto.tags || null,
        });

        const savedTask = await this.kanbanTasksRepository.save(task);

        // If this is a subtask, mark parent as isParent
        if (createTaskDto.parentTaskId) {
            await this.kanbanTasksRepository.update(createTaskDto.parentTaskId, {
                isParent: true,
            });
        }

        return await this.kanbanTasksRepository.findOne({
            where: { id: savedTask.id },
            relations: ['assignee', 'subtasks'],
        });
    }

    async updateTask(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
        const task = await this.kanbanTasksRepository.findOne({
            where: { id },
            relations: ['kanbanColumn', 'kanbanColumn.kanbanBoard', 'kanbanColumn.kanbanBoard.item'],
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        await this.verifyItemAccess(task.kanbanColumn.kanbanBoard.itemId, userId);

        // Update task with new fields
        const updateData: any = { ...updateTaskDto };
        if (updateTaskDto.done !== undefined) {
            updateData.done = updateTaskDto.done;
        }
        if (updateTaskDto.isParent !== undefined) {
            updateData.isParent = updateTaskDto.isParent;
        }
        if (updateTaskDto.tags !== undefined) {
            updateData.tags = updateTaskDto.tags;
        }

        await this.kanbanTasksRepository.update(id, updateData);
        return await this.kanbanTasksRepository.findOne({
            where: { id },
            relations: ['assignee', 'subtasks'],
        });
    }

    async deleteTask(id: string, userId: string) {
        const task = await this.kanbanTasksRepository.findOne({
            where: { id },
            relations: ['kanbanColumn', 'kanbanColumn.kanbanBoard', 'kanbanColumn.kanbanBoard.item'],
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        await this.verifyItemAccess(task.kanbanColumn.kanbanBoard.itemId, userId);

        await this.kanbanTasksRepository.delete(id);
        return { message: 'Task deleted successfully' };
    }

    async moveTask(id: string, moveTaskDto: MoveTaskDto, userId: string) {
        const task = await this.kanbanTasksRepository.findOne({
            where: { id },
            relations: ['kanbanColumn', 'kanbanColumn.kanbanBoard', 'kanbanColumn.kanbanBoard.item'],
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        await this.verifyItemAccess(task.kanbanColumn.kanbanBoard.itemId, userId);

        const targetColumn = await this.kanbanColumnsRepository.findOne({
            where: { id: moveTaskDto.kanbanColumnId },
            relations: ['kanbanBoard'],
        });

        if (!targetColumn) {
            throw new NotFoundException('Target column not found');
        }

        if (targetColumn.kanbanBoardId !== task.kanbanColumn.kanbanBoardId) {
            throw new BadRequestException('Cannot move task to different board');
        }

        const where = task.parentTaskId
            ? {
                kanbanColumnId: moveTaskDto.kanbanColumnId,
                parentTaskId: task.parentTaskId,
            }
            : {
                kanbanColumnId: moveTaskDto.kanbanColumnId,
                parentTaskId: IsNull(),
            };

        const tasks = await this.kanbanTasksRepository.find({
            where,
            order: { position: 'ASC' },
        });

        const currentIndex = tasks.findIndex((t) => t.id === id);
        if (currentIndex !== -1) {
            tasks.splice(currentIndex, 1);
        }

        const newIndex = moveTaskDto.position;
        if (newIndex < 0 || newIndex > tasks.length) {
            throw new BadRequestException('Invalid position');
        }

        tasks.splice(newIndex, 0, task);

        await Promise.all([
            this.kanbanTasksRepository.update(id, {
                kanbanColumnId: moveTaskDto.kanbanColumnId,
                position: newIndex,
            }),
            ...tasks.map((t, index) =>
                t.id !== id
                    ? this.kanbanTasksRepository.update(t.id, { position: index })
                    : Promise.resolve(),
            ),
        ]);

        return await this.kanbanTasksRepository.findOne({
            where: { id },
            relations: ['assignee', 'subtasks'],
        });
    }
}

