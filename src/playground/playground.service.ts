import { Injectable, NotFoundException, ForbiddenException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { Collection } from '../entities/collection.entity';
import { Folder } from '../entities/folder.entity';
import { Item } from '../entities/item.entity';
import { Workspace } from '../entities/workspace.entity';
import { WorkspaceMember } from '../entities/workspace-member.entity';
import { KanbanBoard } from '../entities/kanban-board.entity';
import { KanbanColumn } from '../entities/kanban-column.entity';
import { KanbanTask } from '../entities/kanban-task.entity';
import { ItemType } from '../entities/item-type.enum';
import { IconType } from '../entities/icon-type.enum';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ReorderDto } from './dto/reorder.dto';
import { MoveDto } from './dto/move.dto';

@Injectable()
export class PlaygroundService {
    constructor(
        @InjectRepository(Collection)
        private readonly collectionsRepository: Repository<Collection>,
        @InjectRepository(Folder)
        private readonly foldersRepository: Repository<Folder>,
        @InjectRepository(Item)
        private readonly itemsRepository: Repository<Item>,
        @InjectRepository(Workspace)
        private readonly workspacesRepository: Repository<Workspace>,
        @InjectRepository(WorkspaceMember)
        private readonly workspaceMembersRepository: Repository<WorkspaceMember>,
        @InjectRepository(KanbanBoard)
        private readonly kanbanBoardsRepository: Repository<KanbanBoard>,
        @InjectRepository(KanbanColumn)
        private readonly kanbanColumnsRepository: Repository<KanbanColumn>,
        @InjectRepository(KanbanTask)
        private readonly kanbanTasksRepository: Repository<KanbanTask>,
    ) { }

    private readonly logger = new Logger(PlaygroundService.name);

    // Helper: Verify workspace access
    private async verifyWorkspaceAccess(workspaceId: string, userId: string): Promise<void> {
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
    }

    // Helper: Get max position for ordering
    private async getMaxPosition(
        repository: Repository<Collection | Folder | Item>,
        where: any,
    ): Promise<number> {
        const result = await repository.findOne({
            where,
            order: { position: 'DESC' },
            select: ['position'],
        });
        return result ? result.position + 1 : 0;
    }

    // Collections
    async createCollection(createCollectionDto: CreateCollectionDto, userId: string) {
        await this.verifyWorkspaceAccess(createCollectionDto.workspaceId, userId);

        const maxPosition = await this.getMaxPosition(this.collectionsRepository, {
            workspaceId: createCollectionDto.workspaceId,
        });

        const collection = this.collectionsRepository.create({
            ...createCollectionDto,
            position: maxPosition,
        });

        return await this.collectionsRepository.save(collection);
    }

    async findAllCollections(workspaceId: string, userId: string) {
        await this.verifyWorkspaceAccess(workspaceId, userId);

        return await this.collectionsRepository.find({
            where: { workspaceId },
            relations: ['folders', 'items'],
            order: { position: 'ASC' },
        });
    }

    async findOneCollection(id: string, userId: string) {
        const collection = await this.collectionsRepository.findOne({
            where: { id },
            relations: ['workspace'],
        });

        if (!collection) {
            throw new NotFoundException('Collection not found');
        }

        await this.verifyWorkspaceAccess(collection.workspaceId, userId);

        // Get all folders and items for this collection (optimized query)
        const [folders, items] = await Promise.all([
            this.foldersRepository.find({
                where: { collectionId: id },
                relations: ['childFolders', 'items'],
                order: { position: 'ASC' },
            }),
            this.itemsRepository.find({
                where: { collectionId: id, parentFolderId: IsNull() },
                order: { position: 'ASC' },
            }),
        ]);

        // Organize folders hierarchically
        type FolderWithChildren = Folder & { childFolders: Folder[]; items: Item[] };
        const folderMap = new Map<string, FolderWithChildren>(
            folders.map((f) => [f.id, { ...f, childFolders: [] as Folder[], items: [] as Item[] }])
        );
        const rootFolders: FolderWithChildren[] = [];

        folders.forEach((folder) => {
            const folderWithChildren = folderMap.get(folder.id);
            if (!folderWithChildren) return;

            if (folder.parentFolderId) {
                const parent = folderMap.get(folder.parentFolderId);
                if (parent) {
                    parent.childFolders.push(folderWithChildren);
                }
            } else {
                rootFolders.push(folderWithChildren);
            }
        });

        // Get items for each folder
        const folderItems = await this.itemsRepository.find({
            where: { collectionId: id, parentFolderId: In(folders.map((f) => f.id)) },
            order: { position: 'ASC' },
        });

        folderItems.forEach((item) => {
            const folder = folderMap.get(item.parentFolderId!);
            if (folder) {
                folder.items.push(item);
            }
        });

        return {
            ...collection,
            folders: rootFolders,
            items,
        };
    }

    async updateCollection(id: string, updateCollectionDto: UpdateCollectionDto, userId: string) {
        const collection = await this.collectionsRepository.findOne({
            where: { id },
        });

        if (!collection) {
            throw new NotFoundException('Collection not found');
        }

        await this.verifyWorkspaceAccess(collection.workspaceId, userId);

        await this.collectionsRepository.update(id, updateCollectionDto);
        return await this.findOneCollection(id, userId);
    }

    async deleteCollection(id: string, userId: string) {
        const collection = await this.collectionsRepository.findOne({
            where: { id },
        });

        if (!collection) {
            throw new NotFoundException('Collection not found');
        }

        await this.verifyWorkspaceAccess(collection.workspaceId, userId);

        await this.collectionsRepository.delete(id);
        return { message: 'Collection deleted successfully' };
    }


    async reorderCollection(id: string, reorderDto: ReorderDto, userId: string) {
        const collection = await this.collectionsRepository.findOne({
            where: { id },
        });

        if (!collection) {
            throw new NotFoundException('Collection not found');
        }

        await this.verifyWorkspaceAccess(collection.workspaceId, userId);

        const collections = await this.collectionsRepository.find({
            where: { workspaceId: collection.workspaceId },
            order: { position: 'ASC' },
        });

        const currentIndex = collections.findIndex((c) => c.id === id);
        if (currentIndex === -1) {
            throw new NotFoundException('Collection not found');
        }

        const newIndex = reorderDto.position;
        if (newIndex < 0 || newIndex >= collections.length) {
            throw new BadRequestException('Invalid position');
        }

        collections.splice(currentIndex, 1);
        collections.splice(newIndex, 0, collection);

        await Promise.all(
            collections.map((c, index) =>
                this.collectionsRepository.update(c.id, { position: index }),
            ),
        );

        return await this.findOneCollection(id, userId);
    }

    // Folders
    async createFolder(createFolderDto: CreateFolderDto, userId: string) {
        if (!createFolderDto.collectionId && !createFolderDto.parentFolderId) {
            throw new BadRequestException('Either collectionId or parentFolderId must be provided');
        }

        let workspaceId: string;
        let collectionId: string;
        let where: any;

        if (createFolderDto.collectionId) {
            const collection = await this.collectionsRepository.findOne({
                where: { id: createFolderDto.collectionId },
            });
            if (!collection) {
                throw new NotFoundException('Collection not found');
            }
            workspaceId = collection.workspaceId;
            collectionId = collection.id;
            where = { collectionId: createFolderDto.collectionId, parentFolderId: IsNull() };
        } else {
            const parentFolder = await this.foldersRepository.findOne({
                where: { id: createFolderDto.parentFolderId! },
                relations: ['collection'],
            });
            if (!parentFolder) {
                throw new NotFoundException('Parent folder not found');
            }
            
            // Get collectionId from parent folder (must exist since all folders belong to a collection)
            if (!parentFolder.collectionId) {
                // If parent doesn't have collectionId, traverse up to find it
                let currentFolderId: string | null = parentFolder.parentFolderId;
                while (currentFolderId) {
                    const folder = await this.foldersRepository.findOne({
                        where: { id: currentFolderId },
                        relations: ['collection'],
                    });
                    if (folder?.collectionId) {
                        collectionId = folder.collectionId;
                        break;
                    }
                    currentFolderId = folder?.parentFolderId || null;
                }
                if (!collectionId!) {
                    throw new BadRequestException('Could not determine collection for nested folder');
                }
            } else {
                collectionId = parentFolder.collectionId;
            }

            const collection = await this.collectionsRepository.findOne({
                where: { id: collectionId },
            });
            if (!collection) {
                throw new NotFoundException('Collection not found');
            }
            workspaceId = collection.workspaceId;
            where = { parentFolderId: createFolderDto.parentFolderId };
        }

        await this.verifyWorkspaceAccess(workspaceId, userId);

        const maxPosition = await this.getMaxPosition(this.foldersRepository, where);

        const folder = this.foldersRepository.create({
            ...createFolderDto,
            collectionId: collectionId,
            position: maxPosition,
            iconType: createFolderDto.iconType ?? undefined,
        });

        return await this.foldersRepository.save(folder);
    }

    private async getWorkspaceIdFromFolder(folderId: string): Promise<string> {
        let currentFolderId: string | null = folderId;
        while (currentFolderId) {
            const folder = await this.foldersRepository.findOne({
                where: { id: currentFolderId },
                relations: ['collection'],
            });
            if (folder?.collectionId) {
                const collection = await this.collectionsRepository.findOne({
                    where: { id: folder.collectionId },
                });
                return collection!.workspaceId;
            }
            currentFolderId = folder?.parentFolderId || null;
        }
        throw new NotFoundException('Could not determine workspace');
    }

    async findOneFolder(id: string, userId: string) {
        const folder = await this.foldersRepository.findOne({
            where: { id },
            relations: ['collection', 'parentFolder', 'childFolders', 'items'],
        });

        if (!folder) {
            throw new NotFoundException('Folder not found');
        }

        const workspaceId = folder.collectionId
            ? (await this.collectionsRepository.findOne({ where: { id: folder.collectionId } }))!
                .workspaceId
            : await this.getWorkspaceIdFromFolder(folder.id);

        await this.verifyWorkspaceAccess(workspaceId, userId);

        return folder;
    }

    async updateFolder(id: string, updateFolderDto: UpdateFolderDto, userId: string) {
        const folder = await this.foldersRepository.findOne({
            where: { id },
            relations: ['collection'],
        });

        if (!folder) {
            throw new NotFoundException('Folder not found');
        }

        const workspaceId = folder.collectionId
            ? (await this.collectionsRepository.findOne({ where: { id: folder.collectionId } }))!
                .workspaceId
            : await this.getWorkspaceIdFromFolder(folder.id);

        await this.verifyWorkspaceAccess(workspaceId, userId);

        const updateData: any = { ...updateFolderDto };
        if (updateData.iconType === null) {
            delete updateData.iconType;
        }
        await this.foldersRepository.update(id, updateData);
        return await this.findOneFolder(id, userId);
    }

    async deleteFolder(id: string, userId: string) {
        const folder = await this.foldersRepository.findOne({
            where: { id },
            relations: ['collection'],
        });

        if (!folder) {
            throw new NotFoundException('Folder not found');
        }

        const workspaceId = folder.collectionId
            ? (await this.collectionsRepository.findOne({ where: { id: folder.collectionId } }))!
                .workspaceId
            : await this.getWorkspaceIdFromFolder(folder.id);

        await this.verifyWorkspaceAccess(workspaceId, userId);

        await this.foldersRepository.delete(id);
        return { message: 'Folder deleted successfully' };
    }


    async moveFolder(id: string, moveDto: MoveDto, userId: string) {
        const folder = await this.foldersRepository.findOne({
            where: { id },
            relations: ['collection'],
        });

        if (!folder) {
            throw new NotFoundException('Folder not found');
        }

        if (!moveDto.collectionId && !moveDto.parentFolderId) {
            throw new BadRequestException('Either collectionId or parentFolderId must be provided');
        }

        let targetWorkspaceId: string;
        let targetCollectionId: string;
        let where: any;

        if (moveDto.collectionId) {
            const collection = await this.collectionsRepository.findOne({
                where: { id: moveDto.collectionId },
            });
            if (!collection) {
                throw new NotFoundException('Target collection not found');
            }
            targetWorkspaceId = collection.workspaceId;
            targetCollectionId = collection.id;
            where = { collectionId: moveDto.collectionId, parentFolderId: IsNull() };
        } else {
            const parentFolder = await this.foldersRepository.findOne({
                where: { id: moveDto.parentFolderId! },
                relations: ['collection'],
            });
            if (!parentFolder) {
                throw new NotFoundException('Target parent folder not found');
            }
            
            // Get collectionId from parent folder
            if (!parentFolder.collectionId) {
                let currentFolderId: string | null = parentFolder.parentFolderId;
                while (currentFolderId) {
                    const f = await this.foldersRepository.findOne({
                        where: { id: currentFolderId },
                        relations: ['collection'],
                    });
                    if (f?.collectionId) {
                        targetCollectionId = f.collectionId;
                        break;
                    }
                    currentFolderId = f?.parentFolderId || null;
                }
                if (!targetCollectionId!) {
                    throw new BadRequestException('Could not determine collection for target folder');
                }
            } else {
                targetCollectionId = parentFolder.collectionId;
            }

            const collection = await this.collectionsRepository.findOne({
                where: { id: targetCollectionId },
            });
            if (!collection) {
                throw new NotFoundException('Collection not found');
            }
            targetWorkspaceId = collection.workspaceId;
            where = { parentFolderId: moveDto.parentFolderId };
        }

        const currentCollectionId = folder.collectionId || await this.getCollectionIdFromFolder(folder.id);
        const currentCollection = await this.collectionsRepository.findOne({
            where: { id: currentCollectionId },
        });
        if (!currentCollection) {
            throw new NotFoundException('Current collection not found');
        }

        if (targetWorkspaceId !== currentCollection.workspaceId) {
            throw new BadRequestException('Cannot move folder to different workspace');
        }

        await this.verifyWorkspaceAccess(targetWorkspaceId, userId);

        const maxPosition =
            moveDto.position !== undefined
                ? moveDto.position
                : await this.getMaxPosition(this.foldersRepository, where);

        await this.foldersRepository.update(id, {
            collectionId: targetCollectionId,
            parentFolderId: moveDto.parentFolderId || null,
            position: maxPosition,
        });

        return await this.findOneFolder(id, userId);
    }

    private async getCollectionIdFromFolder(folderId: string): Promise<string> {
        let currentFolderId: string | null = folderId;
        while (currentFolderId) {
            const folder = await this.foldersRepository.findOne({
                where: { id: currentFolderId },
                relations: ['collection'],
            });
            if (folder?.collectionId) {
                return folder.collectionId;
            }
            currentFolderId = folder?.parentFolderId || null;
        }
        throw new NotFoundException('Could not determine collection');
    }

    async reorderFolder(id: string, reorderDto: ReorderDto, userId: string) {
        const folder = await this.foldersRepository.findOne({
            where: { id },
            relations: ['collection'],
        });

        if (!folder) {
            throw new NotFoundException('Folder not found');
        }

        const workspaceId = folder.collectionId
            ? (await this.collectionsRepository.findOne({ where: { id: folder.collectionId } }))!
                .workspaceId
            : await this.getWorkspaceIdFromFolder(folder.id);

        await this.verifyWorkspaceAccess(workspaceId, userId);

    const where = folder.collectionId
      ? { collectionId: folder.collectionId, parentFolderId: IsNull() }
      : folder.parentFolderId
        ? { parentFolderId: folder.parentFolderId }
        : { parentFolderId: IsNull() };

        const folders = await this.foldersRepository.find({
            where,
            order: { position: 'ASC' },
        });

        const currentIndex = folders.findIndex((f) => f.id === id);
        if (currentIndex === -1) {
            throw new NotFoundException('Folder not found');
        }

        const newIndex = reorderDto.position;
        if (newIndex < 0 || newIndex >= folders.length) {
            throw new BadRequestException('Invalid position');
        }

        folders.splice(currentIndex, 1);
        folders.splice(newIndex, 0, folder);

        await Promise.all(
            folders.map((f, index) => this.foldersRepository.update(f.id, { position: index })),
        );

        return await this.findOneFolder(id, userId);
    }

    // Items
    async createItem(createItemDto: CreateItemDto, userId: string) {
        // collectionId is now mandatory
        if (!createItemDto.collectionId) {
            throw new BadRequestException('collectionId is required');
        }

        // Verify collection exists
        const collection = await this.collectionsRepository.findOne({
            where: { id: createItemDto.collectionId },
        });
        if (!collection) {
            throw new NotFoundException('Collection not found');
        }

        // If parentFolderId is provided, verify it exists and belongs to the same collection
        if (createItemDto.parentFolderId) {
            const parentFolder = await this.foldersRepository.findOne({
                where: { id: createItemDto.parentFolderId },
                relations: ['collection'],
            });
            if (!parentFolder) {
                throw new NotFoundException('Parent folder not found');
            }
            
            // Ensure parent folder belongs to the same collection
            if (parentFolder.collectionId !== createItemDto.collectionId) {
                throw new BadRequestException('Parent folder must belong to the same collection');
            }
        }

        await this.verifyWorkspaceAccess(collection.workspaceId, userId);

        const where = createItemDto.parentFolderId
            ? { collectionId: createItemDto.collectionId, parentFolderId: createItemDto.parentFolderId }
            : { collectionId: createItemDto.collectionId, parentFolderId: IsNull() };

        const maxPosition = await this.getMaxPosition(this.itemsRepository, where);

        const item = this.itemsRepository.create({
            ...createItemDto,
            position: maxPosition,
            iconType: createItemDto.iconType ?? undefined,
        });

        const savedItem = await this.itemsRepository.save(item);

        // Auto-create content based on type
        if (createItemDto.type === ItemType.LIST) {
            const kanbanBoard = this.kanbanBoardsRepository.create({
                itemId: savedItem.id,
            });
            const savedBoard = await this.kanbanBoardsRepository.save(kanbanBoard);

            // Use provided columns or create default columns
            const columnsToCreate = createItemDto.columns && createItemDto.columns.length > 0
                ? createItemDto.columns.map((col) => ({
                    title: col.title,
                    position: col.position,
                    color: col.color || null,
                }))
                : [
                    { title: 'To Do', position: 0, color: '#3b82f6' },
                    { title: 'In Progress', position: 1, color: '#f59e0b' },
                    { title: 'Done', position: 2, color: '#10b981' },
                ];

            const createdColumns = await Promise.all(
                columnsToCreate.map((col) => {
                    const column = this.kanbanColumnsRepository.create({
                        kanbanBoardId: savedBoard.id,
                        title: col.title,
                        position: col.position,
                        color: col.color,
                    });
                    return this.kanbanColumnsRepository.save(column);
                }),
            );

            // Only create default task if using default columns
            if (!createItemDto.columns || createItemDto.columns.length === 0) {
                const todoColumn = createdColumns.find((col) => col.title === 'To Do');
                if (todoColumn) {
                    const defaultTask = this.kanbanTasksRepository.create({
                        kanbanColumnId: todoColumn.id,
                        title: 'hello world',
                        position: 0,
                        done: false,
                        isParent: false,
                        tags: null,
                    });
                    await this.kanbanTasksRepository.save(defaultTask);
                }
            }
        }

        return await this.findOneItem(savedItem.id, userId);
    }

    async findOneItem(id: string, userId: string) {
        const item = await this.itemsRepository.findOne({
            where: { id },
            relations: ['collection', 'parentFolder', 'kanbanBoard', 'document', 'whiteboard'],
        });

        if (!item) {
            throw new NotFoundException('Item not found');
        }

        const workspaceId = item.collectionId
            ? (await this.collectionsRepository.findOne({ where: { id: item.collectionId } }))!
                .workspaceId
            : await this.getWorkspaceIdFromFolder(item.parentFolderId!);

        await this.verifyWorkspaceAccess(workspaceId, userId);

        return item;
    }

    async updateItem(id: string, updateItemDto: UpdateItemDto, userId: string) {
        const item = await this.itemsRepository.findOne({
            where: { id },
            relations: ['collection'],
        });

        if (!item) {
            throw new NotFoundException('Item not found');
        }

        const workspaceId = item.collectionId
            ? (await this.collectionsRepository.findOne({ where: { id: item.collectionId } }))!
                .workspaceId
            : await this.getWorkspaceIdFromFolder(item.parentFolderId!);

        await this.verifyWorkspaceAccess(workspaceId, userId);

        const updateData: any = { ...updateItemDto };
        if (updateData.iconType === null) {
            delete updateData.iconType;
        }
        await this.itemsRepository.update(id, updateData);
        return await this.findOneItem(id, userId);
    }

    async deleteItem(id: string, userId: string) {
        const item = await this.itemsRepository.findOne({
            where: { id },
            relations: ['collection'],
        });

        if (!item) {
            throw new NotFoundException('Item not found');
        }

        const workspaceId = item.collectionId
            ? (await this.collectionsRepository.findOne({ where: { id: item.collectionId } }))!
                .workspaceId
            : await this.getWorkspaceIdFromFolder(item.parentFolderId!);

        await this.verifyWorkspaceAccess(workspaceId, userId);

        await this.itemsRepository.delete(id);
        return { message: 'Item deleted successfully' };
    }


    async moveItem(id: string, moveDto: MoveDto, userId: string) {
        const item = await this.itemsRepository.findOne({
            where: { id },
            relations: ['collection'],
        });

        if (!item) {
            throw new NotFoundException('Item not found');
        }

        if (!moveDto.collectionId && !moveDto.parentFolderId) {
            throw new BadRequestException('Either collectionId or parentFolderId must be provided');
        }

        let targetWorkspaceId: string;
        let targetCollectionId: string;
        let where: any;

        if (moveDto.collectionId) {
            const collection = await this.collectionsRepository.findOne({
                where: { id: moveDto.collectionId },
            });
            if (!collection) {
                throw new NotFoundException('Target collection not found');
            }
            targetWorkspaceId = collection.workspaceId;
            targetCollectionId = collection.id;
            where = { collectionId: moveDto.collectionId, parentFolderId: IsNull() };
        } else {
            const parentFolder = await this.foldersRepository.findOne({
                where: { id: moveDto.parentFolderId! },
                relations: ['collection'],
            });
            if (!parentFolder) {
                throw new NotFoundException('Target parent folder not found');
            }
            
            // Get collectionId from parent folder
            if (!parentFolder.collectionId) {
                targetCollectionId = await this.getCollectionIdFromFolder(parentFolder.id);
            } else {
                targetCollectionId = parentFolder.collectionId;
            }

            const collection = await this.collectionsRepository.findOne({
                where: { id: targetCollectionId },
            });
            if (!collection) {
                throw new NotFoundException('Collection not found');
            }
            targetWorkspaceId = collection.workspaceId;
            where = { collectionId: targetCollectionId, parentFolderId: moveDto.parentFolderId };
        }

        if (!item.collectionId) {
            throw new BadRequestException('Item must have a collectionId');
        }

        const currentCollection = await this.collectionsRepository.findOne({
            where: { id: item.collectionId },
        });
        if (!currentCollection) {
            throw new NotFoundException('Current collection not found');
        }

        if (targetWorkspaceId !== currentCollection.workspaceId) {
            throw new BadRequestException('Cannot move item to different workspace');
        }

        // Ensure parent folder belongs to target collection
        if (moveDto.parentFolderId) {
            const parentFolder = await this.foldersRepository.findOne({
                where: { id: moveDto.parentFolderId },
            });
            if (parentFolder && parentFolder.collectionId !== targetCollectionId) {
                throw new BadRequestException('Parent folder must belong to the target collection');
            }
        }

        await this.verifyWorkspaceAccess(targetWorkspaceId, userId);

        const maxPosition =
            moveDto.position !== undefined
                ? moveDto.position
                : await this.getMaxPosition(this.itemsRepository, where);

        await this.itemsRepository.update(id, {
            collectionId: targetCollectionId,
            parentFolderId: moveDto.parentFolderId || null,
            position: maxPosition,
        });

        return await this.findOneItem(id, userId);
    }

    async reorderItem(id: string, reorderDto: ReorderDto, userId: string) {
        const item = await this.itemsRepository.findOne({
            where: { id },
            relations: ['collection'],
        });

        if (!item) {
            throw new NotFoundException('Item not found');
        }

        const workspaceId = item.collectionId
            ? (await this.collectionsRepository.findOne({ where: { id: item.collectionId } }))!
                .workspaceId
            : await this.getWorkspaceIdFromFolder(item.parentFolderId!);

        await this.verifyWorkspaceAccess(workspaceId, userId);

    const where = item.collectionId
      ? { collectionId: item.collectionId, parentFolderId: IsNull() }
      : item.parentFolderId
        ? { parentFolderId: item.parentFolderId }
        : { parentFolderId: IsNull() };

        const items = await this.itemsRepository.find({
            where,
            order: { position: 'ASC' },
        });

        const currentIndex = items.findIndex((i) => i.id === id);
        if (currentIndex === -1) {
            throw new NotFoundException('Item not found');
        }

        const newIndex = reorderDto.position;
        if (newIndex < 0 || newIndex >= items.length) {
            throw new BadRequestException('Invalid position');
        }

        items.splice(currentIndex, 1);
        items.splice(newIndex, 0, item);

        await Promise.all(
            items.map((i, index) => this.itemsRepository.update(i.id, { position: index })),
        );

        return await this.findOneItem(id, userId);
    }
}

