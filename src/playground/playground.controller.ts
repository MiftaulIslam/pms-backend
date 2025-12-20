import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { PlaygroundService } from './playground.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ReorderDto } from './dto/reorder.dto';
import { MoveDto } from './dto/move.dto';
import { JwtAuthGuard } from '../auth/auth.guard';

@ApiTags('playground')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('playground')
export class PlaygroundController {
    constructor(private readonly playgroundService: PlaygroundService) { }

    // Collections
    /**
     * Create a new collection in a workspace
     * Collections are top-level containers that belong to a workspace.
     * They can contain folders and items directly.
     */
    @Post('collections')
    @ApiOperation({ 
        summary: 'Create a new collection',
        description: 'Creates a new collection in the specified workspace. Collections are the top-level containers in the playground hierarchy.'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                workspaceId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                name: { type: 'string', example: 'ZenFlow' },
                description: { type: 'string', example: 'My project collection', nullable: true },
                iconType: { type: 'string', enum: ['emoji', 'image'], example: 'emoji', nullable: true },
                icon: { type: 'string', example: '🚀', nullable: true },
                iconColor: { type: 'string', example: '#60A5FA', nullable: true },
            },
            required: ['workspaceId', 'name'],
        },
        examples: {
            example1: {
                summary: 'Create collection with emoji icon',
                value: {
                    workspaceId: '29457d4b-1cde-4fe3-ab8c-1df57d2c5d17',
                    name: 'ZenFlow',
                    iconType: 'solid',
                    icon: 'InboxStack',
                    iconColor: '#60A5FA',
                },
            },
            example2: {
                summary: 'Create collection without icon',
                value: {
                    workspaceId: '29457d4b-1cde-4fe3-ab8c-1df57d2c5d17',
                    name: 'My Project',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Collection created successfully' })
    @ApiResponse({ status: 403, description: 'Access denied - user is not a member of the workspace' })
    @ApiResponse({ status: 404, description: 'Workspace not found' })
    createCollection(@Body() createCollectionDto: CreateCollectionDto, @Req() req: any) {
        const userId = req.user?.id;
        return this.playgroundService.createCollection(createCollectionDto, userId);
    }

    /**
     * Get all collections for a workspace
     * Returns all collections belonging to the specified workspace, ordered by position.
     * Includes folders and items nested within each collection.
     */
    @Get('collections')
    @ApiOperation({ 
        summary: 'Get all collections for a workspace',
        description: 'Retrieves all collections for the specified workspace, including their nested folders and items, ordered by position.'
    })
    @ApiResponse({ status: 200, description: 'Collections retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Access denied - user is not a member of the workspace' })
    @ApiResponse({ status: 404, description: 'Workspace not found' })
    findAllCollections(@Query('workspaceId') workspaceId: string, @Req() req: any) {
        const userId = req.user?.id;
        return this.playgroundService.findAllCollections(workspaceId, userId);
    }

    /**
     * Duplicate a collection
     * Creates a copy of the collection at the same workspace level with "-copy" suffix.
     */
    @Post('collections/:id/duplicate')
    @ApiOperation({ 
        summary: 'Duplicate collection',
        description: 'Creates a duplicate of the collection at the same workspace level with "-copy" suffix. Copies name, description, icon, iconColor, and iconType. Also duplicates all nested folders and items recursively.'
    })
    @ApiResponse({ status: 201, description: 'Collection duplicated successfully' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    @ApiResponse({ status: 404, description: 'Collection not found' })
    duplicateCollection(@Param('id') id: string, @Req() req: any) {
        const userId = req.user?.id;
        return this.playgroundService.duplicateCollection(id, userId);
    }

    /**
     * Get a single collection with full hierarchy
     * Returns a collection with all its nested folders and items, including nested folder structures.
     */
    @Get('collections/:id')
    @ApiOperation({ 
        summary: 'Get collection with full hierarchy',
        description: 'Retrieves a single collection with its complete hierarchy including all nested folders and items.'
    })
    @ApiResponse({ status: 200, description: 'Collection retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    @ApiResponse({ status: 404, description: 'Collection not found' })
    findOneCollection(@Param('id') id: string, @Req() req: any) {
        const userId = req.user?.id;
        return this.playgroundService.findOneCollection(id, userId);
    }

    /**
     * Update a collection
     * Updates collection properties such as name, icon type, and icon.
     */
    @Patch('collections/:id')
    @ApiOperation({ 
        summary: 'Update collection',
        description: 'Updates collection properties. Only provided fields will be updated.'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Updated Collection Name' },
                iconType: { type: 'string', enum: ['emoji', 'image'], example: 'emoji', nullable: true },
                icon: { type: 'string', example: '📁', nullable: true },
            },
        },
        examples: {
            example1: {
                summary: 'Update collection name',
                value: {
                    name: 'Updated Collection Name',
                },
            },
            example2: {
                summary: 'Update collection icon',
                value: {
                    iconType: 'emoji',
                    icon: '📁',
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Collection updated successfully' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    @ApiResponse({ status: 404, description: 'Collection not found' })
    updateCollection(
        @Param('id') id: string,
        @Body() updateCollectionDto: UpdateCollectionDto,
        @Req() req: any,
    ) {
        const userId = req.user?.id;
        return this.playgroundService.updateCollection(id, updateCollectionDto, userId);
    }

    /**
     * Delete a collection
     * Deletes a collection and all its nested folders and items (cascade delete).
     */
    @Delete('collections/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ 
        summary: 'Delete collection',
        description: 'Deletes a collection and all its nested folders and items. This operation cannot be undone.'
    })
    @ApiResponse({ status: 204, description: 'Collection deleted successfully' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    @ApiResponse({ status: 404, description: 'Collection not found' })
    deleteCollection(@Param('id') id: string, @Req() req: any) {
        const userId = req.user?.id;
        return this.playgroundService.deleteCollection(id, userId);
    }


    /**
     * Reorder collections within a workspace
     * Changes the position of a collection within the workspace's collection list.
     */
    @Patch('collections/:id/reorder')
    @ApiOperation({ 
        summary: 'Reorder collection',
        description: 'Changes the position of a collection within the workspace. Position is 0-based.'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                position: { type: 'number', example: 2, description: 'New position (0-based index)' },
            },
            required: ['position'],
        },
        examples: {
            example1: {
                summary: 'Move to position 0',
                value: {
                    position: 0,
                },
            },
            example2: {
                summary: 'Move to position 2',
                value: {
                    position: 2,
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Collection reordered successfully' })
    @ApiResponse({ status: 400, description: 'Invalid position' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    @ApiResponse({ status: 404, description: 'Collection not found' })
    reorderCollection(@Param('id') id: string, @Body() reorderDto: ReorderDto, @Req() req: any) {
        const userId = req.user?.id;
        return this.playgroundService.reorderCollection(id, reorderDto, userId);
    }

    // Folders
    /**
     * Create a new folder
     * Creates a folder that can be placed directly in a collection or nested within another folder.
     * Folders can contain other folders and items.
     */
    @Post('folders')
    @ApiOperation({ 
        summary: 'Create a new folder',
        description: 'Creates a new folder. Must specify either collectionId (root folder) or parentFolderId (nested folder).'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                collectionId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000', nullable: true },
                parentFolderId: { type: 'string', example: '660e8400-e29b-41d4-a716-446655440001', nullable: true },
                name: { type: 'string', example: 'zenflow-frontend' },
                description: { type: 'string', example: 'Frontend project folder', nullable: true },
                iconType: { type: 'string', enum: ['emoji', 'image'], example: 'emoji', nullable: true },
                icon: { type: 'string', example: '📂', nullable: true },
            },
            required: ['name'],
        },
        examples: {
            example1: {
                summary: 'Create folder in collection',
                value: {
                    collectionId: '859fba77-64b9-4d7f-94c2-15baf24b3da6',
                    name: 'zenflow-frontend',
                    iconType: 'emoji',
                    icon: '📂',
                },
            },
            example2: {
                summary: 'Create nested folder',
                value: {
                    parentFolderId: '660e8400-e29b-41d4-a716-446655440001',
                    name: 'components',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Folder created successfully' })
    @ApiResponse({ status: 400, description: 'Either collectionId or parentFolderId must be provided' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    @ApiResponse({ status: 404, description: 'Collection or parent folder not found' })
    createFolder(@Body() createFolderDto: CreateFolderDto, @Req() req: any) {
        const userId = req.user?.id;
        return this.playgroundService.createFolder(createFolderDto, userId);
    }

    /**
     * Get a folder with its children
     * Returns a folder with all its nested folders and items.
     */
    @Get('folders/:id')
    @ApiOperation({ 
        summary: 'Get folder with children',
        description: 'Retrieves a folder with all its nested folders and items.'
    })
    @ApiResponse({ status: 200, description: 'Folder retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    @ApiResponse({ status: 404, description: 'Folder not found' })
    findOneFolder(@Param('id') id: string, @Req() req: any) {
        const userId = req.user?.id;
        return this.playgroundService.findOneFolder(id, userId);
    }

    /**
     * Update a folder
     * Updates folder properties such as name, icon type, and icon.
     */
    @Patch('folders/:id')
    @ApiOperation({ 
        summary: 'Update folder',
        description: 'Updates folder properties. Only provided fields will be updated.'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Updated Folder Name' },
                iconType: { type: 'string', enum: ['emoji', 'image'], example: 'emoji', nullable: true },
                icon: { type: 'string', example: '📁', nullable: true },
            },
        },
        examples: {
            example1: {
                summary: 'Update folder name',
                value: {
                    name: 'Updated Folder Name',
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Folder updated successfully' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    @ApiResponse({ status: 404, description: 'Folder not found' })
    updateFolder(
        @Param('id') id: string,
        @Body() updateFolderDto: UpdateFolderDto,
        @Req() req: any,
    ) {
        const userId = req.user?.id;
        return this.playgroundService.updateFolder(id, updateFolderDto, userId);
    }

    /**
     * Delete a folder
     * Deletes a folder and all its nested folders and items (cascade delete).
     */
    @Delete('folders/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ 
        summary: 'Delete folder',
        description: 'Deletes a folder and all its nested folders and items. This operation cannot be undone.'
    })
    @ApiResponse({ status: 204, description: 'Folder deleted successfully' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    @ApiResponse({ status: 404, description: 'Folder not found' })
    deleteFolder(@Param('id') id: string, @Req() req: any) {
        const userId = req.user?.id;
        return this.playgroundService.deleteFolder(id, userId);
    }


    /**
     * Move a folder to a different parent
     * Moves a folder to a different collection or parent folder within the same workspace.
     */
    @Patch('folders/:id/move')
    @ApiOperation({ 
        summary: 'Move folder to different parent',
        description: 'Moves a folder to a different collection or parent folder. Cannot move to a different workspace.'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                collectionId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000', nullable: true },
                parentFolderId: { type: 'string', example: '660e8400-e29b-41d4-a716-446655440001', nullable: true },
                position: { type: 'number', example: 0, nullable: true },
            },
        },
        examples: {
            example1: {
                summary: 'Move to collection',
                value: {
                    collectionId: '550e8400-e29b-41d4-a716-446655440000',
                    position: 0,
                },
            },
            example2: {
                summary: 'Move to parent folder',
                value: {
                    parentFolderId: '660e8400-e29b-41d4-a716-446655440001',
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Folder moved successfully' })
    @ApiResponse({ status: 400, description: 'Invalid move operation' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    @ApiResponse({ status: 404, description: 'Folder or target not found' })
    moveFolder(@Param('id') id: string, @Body() moveDto: MoveDto, @Req() req: any) {
        const userId = req.user?.id;
        return this.playgroundService.moveFolder(id, moveDto, userId);
    }

    /**
     * Reorder folder within its parent
     * Changes the position of a folder within its parent (collection or folder).
     */
    @Patch('folders/:id/reorder')
    @ApiOperation({ 
        summary: 'Reorder folder within parent',
        description: 'Changes the position of a folder within its parent container. Position is 0-based.'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                position: { type: 'number', example: 1, description: 'New position (0-based index)' },
            },
            required: ['position'],
        },
        examples: {
            example1: {
                summary: 'Move to first position',
                value: {
                    position: 0,
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Folder reordered successfully' })
    @ApiResponse({ status: 400, description: 'Invalid position' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    @ApiResponse({ status: 404, description: 'Folder not found' })
    reorderFolder(@Param('id') id: string, @Body() reorderDto: ReorderDto, @Req() req: any) {
        const userId = req.user?.id;
        return this.playgroundService.reorderFolder(id, reorderDto, userId);
    }

    /**
     * Duplicate a folder
     * Creates a copy of the folder at the same level (same parent) with "-copy" suffix.
     */
    @Post('folders/:id/duplicate')
    @ApiOperation({ 
        summary: 'Duplicate folder',
        description: 'Creates a duplicate of the folder at the same level (same parent) with "-copy" suffix. Copies name, description, icon, iconColor, and iconType.'
    })
    @ApiResponse({ status: 201, description: 'Folder duplicated successfully' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    @ApiResponse({ status: 404, description: 'Folder not found' })
    duplicateFolder(@Param('id') id: string, @Req() req: any) {
        const userId = req.user?.id;
        return this.playgroundService.duplicateFolder(id, userId);
    }

    // Items
    /**
     * Create a new item (list/doc/whiteboard)
     * Creates an item that can be a list (kanban board), document, or whiteboard.
     * If type is 'list', a kanban board is automatically created.
     * collectionId is required - items must belong to a collection.
     */
    @Post('items')
    @ApiOperation({ 
        summary: 'Create a new item (list/doc/whiteboard)',
        description: 'Creates a new item. collectionId is required. parentFolderId is optional. If type is "list", a kanban board is automatically created. If columns are provided in the request, those columns will be created; otherwise, default columns (To Do, In Progress, Done) will be created. If using default columns, a sample task "hello world" is also created in the To Do column.'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                collectionId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                parentFolderId: { type: 'string', example: '660e8400-e29b-41d4-a716-446655440001', nullable: true },
                name: { type: 'string', example: 'My List' },
                description: { type: 'string', example: 'Project management list', nullable: true },
                type: { type: 'string', enum: ['list', 'doc', 'whiteboard'], example: 'list' },
                iconType: { type: 'string', enum: ['emoji', 'image'], example: 'emoji', nullable: true },
                icon: { type: 'string', example: '📋', nullable: true },
                columns: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            title: { type: 'string', example: 'To Do' },
                            position: { type: 'number', example: 0 },
                            color: { type: 'string', example: '#3b82f6', nullable: true },
                        },
                        required: ['title', 'position'],
                    },
                    nullable: true,
                    description: 'Columns for list type items. If provided, these columns will be created instead of default columns (To Do, In Progress, Done).',
                },
            },
            required: ['collectionId', 'name', 'type'],
        },
        examples: {
            example1: {
                summary: 'Create list item with default columns',
                value: {
                    collectionId: '550e8400-e29b-41d4-a716-446655440000',
                    name: 'My Kanban Board',
                    description: 'Project management board',
                    type: 'list',
                    iconType: 'emoji',
                    icon: '📋',
                },
            },
            example1b: {
                summary: 'Create list item with custom columns',
                value: {
                    collectionId: '550e8400-e29b-41d4-a716-446655440000',
                    name: 'My Kanban Board',
                    description: 'Custom workflow board',
                    type: 'list',
                    columns: [
                        { title: 'Backlog', position: 0, color: '#6366f1' },
                        { title: 'In Progress', position: 1, color: '#f59e0b' },
                        { title: 'Review', position: 2, color: '#8b5cf6' },
                        { title: 'Done', position: 3, color: '#10b981' },
                    ],
                },
            },
            example2: {
                summary: 'Create document item',
                value: {
                    parentFolderId: '660e8400-e29b-41d4-a716-446655440001',
                    name: 'Project Notes',
                    type: 'doc',
                },
            },
            example3: {
                summary: 'Create whiteboard item',
                value: {
                    collectionId: '550e8400-e29b-41d4-a716-446655440000',
                    name: 'Brainstorming',
                    type: 'whiteboard',
                    iconType: 'emoji',
                    icon: '🎨',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Item created successfully' })
    @ApiResponse({ status: 400, description: 'collectionId is required or parent folder must belong to the same collection' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    @ApiResponse({ status: 404, description: 'Collection or parent folder not found' })
    createItem(@Body() createItemDto: CreateItemDto, @Req() req: any) {
        const userId = req.user?.id;
        return this.playgroundService.createItem(createItemDto, userId);
    }

    /**
     * Get item details
     * Returns an item with its associated content (kanban board, document, or whiteboard).
     */
    @Get('items/:id')
    @ApiOperation({ 
        summary: 'Get item details',
        description: 'Retrieves an item with its associated content based on type (kanban board, document, or whiteboard).'
    })
    @ApiResponse({ status: 200, description: 'Item retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    @ApiResponse({ status: 404, description: 'Item not found' })
    findOneItem(@Param('id') id: string, @Req() req: any) {
        const userId = req.user?.id;
        return this.playgroundService.findOneItem(id, userId);
    }

    /**
     * Update an item
     * Updates item properties such as name, icon type, and icon.
     */
    @Patch('items/:id')
    @ApiOperation({ 
        summary: 'Update item',
        description: 'Updates item properties. Only provided fields will be updated.'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Updated Item Name' },
                iconType: { type: 'string', enum: ['emoji', 'image'], example: 'emoji', nullable: true },
                icon: { type: 'string', example: '📝', nullable: true },
            },
        },
        examples: {
            example1: {
                summary: 'Update item name',
                value: {
                    name: 'Updated Item Name',
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Item updated successfully' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    @ApiResponse({ status: 404, description: 'Item not found' })
    updateItem(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto, @Req() req: any) {
        const userId = req.user?.id;
        return this.playgroundService.updateItem(id, updateItemDto, userId);
    }

    /**
     * Delete an item
     * Deletes an item and its associated content (kanban board, document, or whiteboard).
     */
    @Delete('items/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ 
        summary: 'Delete item',
        description: 'Deletes an item and its associated content. This operation cannot be undone.'
    })
    @ApiResponse({ status: 204, description: 'Item deleted successfully' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    @ApiResponse({ status: 404, description: 'Item not found' })
    deleteItem(@Param('id') id: string, @Req() req: any) {
        const userId = req.user?.id;
        return this.playgroundService.deleteItem(id, userId);
    }


    /**
     * Move an item to a different parent
     * Moves an item to a different collection or folder within the same workspace.
     */
    @Patch('items/:id/move')
    @ApiOperation({ 
        summary: 'Move item to different parent',
        description: 'Moves an item to a different collection or folder. Cannot move to a different workspace.'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                collectionId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000', nullable: true },
                parentFolderId: { type: 'string', example: '660e8400-e29b-41d4-a716-446655440001', nullable: true },
                position: { type: 'number', example: 0, nullable: true },
            },
        },
        examples: {
            example1: {
                summary: 'Move to collection',
                value: {
                    collectionId: '550e8400-e29b-41d4-a716-446655440000',
                    position: 0,
                },
            },
            example2: {
                summary: 'Move to folder',
                value: {
                    parentFolderId: '660e8400-e29b-41d4-a716-446655440001',
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Item moved successfully' })
    @ApiResponse({ status: 400, description: 'Invalid move operation' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    @ApiResponse({ status: 404, description: 'Item or target not found' })
    moveItem(@Param('id') id: string, @Body() moveDto: MoveDto, @Req() req: any) {
        const userId = req.user?.id;
        return this.playgroundService.moveItem(id, moveDto, userId);
    }

    /**
     * Reorder item within its parent
     * Changes the position of an item within its parent (collection or folder).
     */
    @Patch('items/:id/reorder')
    @ApiOperation({ 
        summary: 'Reorder item within parent',
        description: 'Changes the position of an item within its parent container. Position is 0-based.'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                position: { type: 'number', example: 1, description: 'New position (0-based index)' },
            },
            required: ['position'],
        },
        examples: {
            example1: {
                summary: 'Move to first position',
                value: {
                    position: 0,
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Item reordered successfully' })
    @ApiResponse({ status: 400, description: 'Invalid position' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    @ApiResponse({ status: 404, description: 'Item not found' })
    reorderItem(@Param('id') id: string, @Body() reorderDto: ReorderDto, @Req() req: any) {
        const userId = req.user?.id;
        return this.playgroundService.reorderItem(id, reorderDto, userId);
    }

    /**
     * Duplicate an item
     * Creates a copy of the item at the same level (same parent) with "-copy" suffix.
     * For list type items, also duplicates the kanban board and columns.
     */
    @Post('items/:id/duplicate')
    @ApiOperation({ 
        summary: 'Duplicate item',
        description: 'Creates a duplicate of the item at the same level (same parent) with "-copy" suffix. Copies name, description, icon, iconColor, iconType, and type. For list type items, also duplicates the kanban board and columns.'
    })
    @ApiResponse({ status: 201, description: 'Item duplicated successfully' })
    @ApiResponse({ status: 403, description: 'Access denied' })
    @ApiResponse({ status: 404, description: 'Item not found' })
    duplicateItem(@Param('id') id: string, @Req() req: any) {
        const userId = req.user?.id;
        return this.playgroundService.duplicateItem(id, userId);
    }
}

