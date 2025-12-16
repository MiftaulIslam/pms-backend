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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { KanbanService } from './kanban.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { ReorderDto } from '../dto/reorder.dto';
import { JwtAuthGuard } from '../../auth/auth.guard';

@ApiTags('kanban')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('playground/kanban')
export class KanbanController {
  constructor(private readonly kanbanService: KanbanService) {}

  /**
   * Create kanban board for a list item
   * Creates a kanban board for an item with type 'list'.
   * Note: Kanban boards are automatically created when creating a list item, so this endpoint is mainly for manual creation.
   */
  @Post('boards')
  @ApiOperation({ 
    summary: 'Create kanban board for list item',
    description: 'Creates a kanban board for an item with type "list". Note: Kanban boards are automatically created when creating a list item via the items endpoint.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        itemId: { type: 'string', example: '770e8400-e29b-41d4-a716-446655440002' },
      },
      required: ['itemId'],
    },
    examples: {
      example1: {
        summary: 'Create kanban board',
        value: {
          itemId: '770e8400-e29b-41d4-a716-446655440002',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Kanban board created successfully' })
  @ApiResponse({ status: 400, description: 'Item is not a list type or board already exists' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  createKanbanBoard(@Body() body: { itemId: string }, @Req() req: any) {
    const userId = req.user?.id;
    return this.kanbanService.createKanbanBoard(body.itemId, userId);
  }

  /**
   * Get kanban board with columns and tasks
   * Returns a kanban board with all its columns and tasks, ordered by position.
   * Includes task details like assignee, priority, due date, and subtasks.
   */
  @Get('boards/:itemId')
  @ApiOperation({ 
    summary: 'Get kanban board with columns and tasks',
    description: 'Retrieves a kanban board with all its columns and tasks. Columns and tasks are ordered by position. Includes task details like assignee, priority, due date, and subtasks.'
  })
  @ApiResponse({ status: 200, description: 'Kanban board retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Kanban board not found' })
  getKanbanBoard(@Param('itemId') itemId: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.kanbanService.getKanbanBoard(itemId, userId);
  }

  /**
   * Create a kanban column
   * Creates a new column in a kanban board. Columns are ordered by position.
   */
  @Post('columns')
  @ApiOperation({ 
    summary: 'Create kanban column',
    description: 'Creates a new column in a kanban board. The column will be added at the end of the column list.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        kanbanBoardId: { type: 'string', example: '880e8400-e29b-41d4-a716-446655440003' },
        title: { type: 'string', example: 'To Do' },
        color: { type: 'string', example: '#3b82f6', nullable: true },
      },
      required: ['kanbanBoardId', 'title'],
    },
    examples: {
      example1: {
        summary: 'Create column with color',
        value: {
          kanbanBoardId: '880e8400-e29b-41d4-a716-446655440003',
          title: 'In Progress',
          color: '#10b981',
        },
      },
      example2: {
        summary: 'Create column without color',
        value: {
          kanbanBoardId: '880e8400-e29b-41d4-a716-446655440003',
          title: 'Done',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Column created successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Kanban board not found' })
  createColumn(@Body() createColumnDto: CreateColumnDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.kanbanService.createColumn(createColumnDto, userId);
  }

  /**
   * Update a kanban column
   * Updates column properties such as title and color.
   */
  @Patch('columns/:id')
  @ApiOperation({ 
    summary: 'Update kanban column',
    description: 'Updates column properties. Only provided fields will be updated.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Updated Column Title' },
        color: { type: 'string', example: '#ef4444', nullable: true },
      },
    },
    examples: {
      example1: {
        summary: 'Update column title',
        value: {
          title: 'In Review',
        },
      },
      example2: {
        summary: 'Update column color',
        value: {
          color: '#8b5cf6',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Column updated successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Column not found' })
  updateColumn(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateColumnDto>,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.kanbanService.updateColumn(id, updateData, userId);
  }

  /**
   * Reorder a kanban column
   * Changes the position of a column within the kanban board.
   */
  @Patch('columns/:id/reorder')
  @ApiOperation({ 
    summary: 'Reorder kanban column',
    description: 'Changes the position of a column within the kanban board. Position is 0-based.'
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
  @ApiResponse({ status: 200, description: 'Column reordered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid position' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Column not found' })
  reorderColumn(@Param('id') id: string, @Body() reorderDto: ReorderDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.kanbanService.reorderColumn(id, reorderDto, userId);
  }

  /**
   * Delete a kanban column
   * Deletes a column and all its tasks (cascade delete).
   */
  @Delete('columns/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete kanban column',
    description: 'Deletes a column and all its tasks. This operation cannot be undone.'
  })
  @ApiResponse({ status: 204, description: 'Column deleted successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Column not found' })
  deleteColumn(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.kanbanService.deleteColumn(id, userId);
  }

  /**
   * Create a kanban task
   * Creates a new task in a kanban column. Tasks can have subtasks by specifying parentTaskId.
   */
  @Post('tasks')
  @ApiOperation({ 
    summary: 'Create kanban task',
    description: 'Creates a new task in a kanban column. The task will be added at the end of the column. Can create subtasks by specifying parentTaskId.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        kanbanColumnId: { type: 'string', example: '990e8400-e29b-41d4-a716-446655440004' },
        title: { type: 'string', example: 'Design new user interface' },
        description: { type: 'string', example: 'Create wireframes and mockups for the new dashboard', nullable: true },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], example: 'high', nullable: true },
        assigneeId: { type: 'string', example: '110e8400-e29b-41d4-a716-446655440005', nullable: true },
        dueDate: { type: 'string', format: 'date-time', example: '2025-12-31T23:59:59Z', nullable: true },
        parentTaskId: { type: 'string', example: '120e8400-e29b-41d4-a716-446655440006', nullable: true },
      },
      required: ['kanbanColumnId', 'title'],
    },
    examples: {
      example1: {
        summary: 'Create task with all fields',
        value: {
          kanbanColumnId: '990e8400-e29b-41d4-a716-446655440004',
          title: 'Design new user interface',
          description: 'Create wireframes and mockups for the new dashboard',
          priority: 'high',
          assigneeId: '110e8400-e29b-41d4-a716-446655440005',
          dueDate: '2025-12-31T23:59:59Z',
        },
      },
      example2: {
        summary: 'Create simple task',
        value: {
          kanbanColumnId: '990e8400-e29b-41d4-a716-446655440004',
          title: 'Review pull request',
        },
      },
      example3: {
        summary: 'Create subtask',
        value: {
          kanbanColumnId: '990e8400-e29b-41d4-a716-446655440004',
          title: 'Header layout',
          parentTaskId: '120e8400-e29b-41d4-a716-446655440006',
          priority: 'medium',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Column not found' })
  createTask(@Body() createTaskDto: CreateTaskDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.kanbanService.createTask(createTaskDto, userId);
  }

  /**
   * Update a kanban task
   * Updates task properties such as title, description, priority, assignee, and due date.
   */
  @Patch('tasks/:id')
  @ApiOperation({ 
    summary: 'Update kanban task',
    description: 'Updates task properties. Only provided fields will be updated.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Updated Task Title' },
        description: { type: 'string', example: 'Updated description', nullable: true },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], example: 'medium', nullable: true },
        assigneeId: { type: 'string', example: '110e8400-e29b-41d4-a716-446655440005', nullable: true },
        dueDate: { type: 'string', format: 'date-time', example: '2025-12-31T23:59:59Z', nullable: true },
      },
    },
    examples: {
      example1: {
        summary: 'Update task title',
        value: {
          title: 'Updated Task Title',
        },
      },
      example2: {
        summary: 'Update priority and assignee',
        value: {
          priority: 'urgent',
          assigneeId: '110e8400-e29b-41d4-a716-446655440005',
        },
      },
      example3: {
        summary: 'Update due date',
        value: {
          dueDate: '2025-12-31T23:59:59Z',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  updateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.kanbanService.updateTask(id, updateTaskDto, userId);
  }

  /**
   * Delete a kanban task
   * Deletes a task and all its subtasks (cascade delete).
   */
  @Delete('tasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete kanban task',
    description: 'Deletes a task and all its subtasks. This operation cannot be undone.'
  })
  @ApiResponse({ status: 204, description: 'Task deleted successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  deleteTask(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.kanbanService.deleteTask(id, userId);
  }

  /**
   * Move a task between columns or positions
   * Moves a task to a different column or changes its position within the same column.
   */
  @Patch('tasks/:id/move')
  @ApiOperation({ 
    summary: 'Move task between columns/positions',
    description: 'Moves a task to a different column or changes its position within the same column. Cannot move to a different board.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        kanbanColumnId: { type: 'string', example: '990e8400-e29b-41d4-a716-446655440004' },
        position: { type: 'number', example: 0, description: 'New position (0-based index)' },
      },
      required: ['kanbanColumnId', 'position'],
    },
    examples: {
      example1: {
        summary: 'Move to different column',
        value: {
          kanbanColumnId: '990e8400-e29b-41d4-a716-446655440004',
          position: 0,
        },
      },
      example2: {
        summary: 'Reorder within same column',
        value: {
          kanbanColumnId: '990e8400-e29b-41d4-a716-446655440004',
          position: 2,
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Task moved successfully' })
  @ApiResponse({ status: 400, description: 'Cannot move to different board or invalid position' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Task or column not found' })
  moveTask(@Param('id') id: string, @Body() moveTaskDto: MoveTaskDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.kanbanService.moveTask(id, moveTaskDto, userId);
  }
}
