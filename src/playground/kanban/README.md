# Kanban Module

This module handles kanban board operations including columns and tasks management for list items in the playground system.

## Overview

Kanban boards are automatically created when an item with type `list` is created. This module provides endpoints to manage:

- **Kanban Boards**: Container for columns and tasks
- **Columns**: Status columns (e.g., "To Do", "In Progress", "Done")
- **Tasks**: Individual tasks with priority, assignee, due date, and subtask support

## Endpoints

### Kanban Boards

#### Create Kanban Board

- **Endpoint**: `POST /playground/kanban/boards`
- **Description**: Create a kanban board for a list item. Note: Boards are automatically created when creating list items.
- **Authentication**: Required (JWT)
- **Request Body**:

```json
{
  "itemId": "item-uuid"
}
```

**Response**:

```json
{
  "id": "board-uuid",
  "itemId": "item-uuid",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

#### Get Kanban Board

- **Endpoint**: `GET /playground/kanban/boards/:itemId`
- **Description**: Get kanban board with all columns and tasks, ordered by position
- **Authentication**: Required (JWT)
- **Response**:

```json
{
  "id": "board-uuid",
  "itemId": "item-uuid",
  "columns": [
    {
      "id": "column-uuid",
      "kanbanBoardId": "board-uuid",
      "title": "To Do",
      "position": 0,
      "color": "#3b82f6",
      "tasks": [
        {
          "id": "task-uuid",
          "kanbanColumnId": "column-uuid",
          "title": "Design new UI",
          "description": "Create wireframes",
          "priority": "high",
          "assigneeId": "user-uuid",
          "dueDate": "2025-12-31T23:59:59Z",
          "position": 0,
          "subtasks": []
        }
      ]
    }
  ]
}
```

### Columns

#### Create Column

- **Endpoint**: `POST /playground/kanban/columns`
- **Description**: Create a new column in a kanban board
- **Authentication**: Required (JWT)
- **Request Body**:

```json
{
  "kanbanBoardId": "board-uuid",
  "title": "In Progress",
  "color": "#10b981"
}
```

**Example Request**:

```javascript
fetch('/playground/kanban/columns', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <jwt-token>'
  },
  body: JSON.stringify({
    kanbanBoardId: 'board-uuid',
    title: 'In Progress',
    color: '#10b981'
  })
});
```

**Response**: Column object

#### Update Column

- **Endpoint**: `PATCH /playground/kanban/columns/:id`
- **Description**: Update column properties
- **Authentication**: Required (JWT)
- **Request Body**:

```json
{
  "title": "Updated Column Title",
  "color": "#ef4444"
}
```

#### Delete Column

- **Endpoint**: `DELETE /playground/kanban/columns/:id`
- **Description**: Delete column and all its tasks (cascade)
- **Authentication**: Required (JWT)
- **Response**: 204 No Content

### Tasks

#### Create Task

- **Endpoint**: `POST /playground/kanban/tasks`
- **Description**: Create a new task in a kanban column. Can create subtasks by specifying parentTaskId.
- **Authentication**: Required (JWT)
- **Request Body**:

```json
{
  "kanbanColumnId": "column-uuid",
  "title": "Design new user interface",
  "description": "Create wireframes and mockups",
  "priority": "high",
  "assigneeId": "user-uuid",
  "dueDate": "2025-12-31T23:59:59Z"
}
```

**Example Request**:

```javascript
fetch('/playground/kanban/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <jwt-token>'
  },
  body: JSON.stringify({
    kanbanColumnId: 'column-uuid',
    title: 'Design new user interface',
    description: 'Create wireframes and mockups for the new dashboard',
    priority: 'high',
    assigneeId: 'user-uuid',
    dueDate: '2025-12-31T23:59:59Z'
  })
});
```

**Response**: Task object with relations

#### Create Subtask

- **Endpoint**: `POST /playground/kanban/tasks`
- **Description**: Create a subtask by specifying parentTaskId
- **Authentication**: Required (JWT)
- **Request Body**:

```json
{
  "kanbanColumnId": "column-uuid",
  "title": "Header layout",
  "parentTaskId": "parent-task-uuid",
  "priority": "medium"
}
```

#### Update Task

- **Endpoint**: `PATCH /playground/kanban/tasks/:id`
- **Description**: Update task properties
- **Authentication**: Required (JWT)
- **Request Body**:

```json
{
  "title": "Updated Task Title",
  "priority": "urgent",
  "assigneeId": "user-uuid",
  "dueDate": "2025-12-31T23:59:59Z"
}
```

#### Delete Task

- **Endpoint**: `DELETE /playground/kanban/tasks/:id`
- **Description**: Delete task and all its subtasks (cascade)
- **Authentication**: Required (JWT)
- **Response**: 204 No Content

#### Move Task

- **Endpoint**: `PATCH /playground/kanban/tasks/:id/move`
- **Description**: Move task to a different column or change its position within the same column
- **Authentication**: Required (JWT)
- **Request Body**:

```json
{
  "kanbanColumnId": "target-column-uuid",
  "position": 0
}
```

**Example**: Move task to "Done" column at position 0

```javascript
fetch('/playground/kanban/tasks/task-uuid/move', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <jwt-token>'
  },
  body: JSON.stringify({
    kanbanColumnId: 'done-column-uuid',
    position: 0
  })
});
```

## Task Priorities

Tasks support the following priority levels:

- `low` - Low priority
- `medium` - Medium priority (default)
- `high` - High priority
- `urgent` - Urgent priority

## Subtasks

Tasks can have nested subtasks:

- Subtasks are created by specifying `parentTaskId`
- Subtasks maintain their own position within the parent task
- Deleting a parent task deletes all subtasks (cascade)
- Subtasks can be moved between columns independently

## Position Management

- Columns are ordered by `position` (0-based)
- Tasks within a column are ordered by `position` (0-based)
- Positions are automatically normalized after moves/reorders
- New items are added at the end (max position + 1)

## Authentication

All endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

## Authorization Rules

- All operations require workspace membership (owner or member)
- Users can only access kanban boards within their workspaces
- Moving tasks between different boards is not allowed

## Error Responses

- **400 Bad Request**: Invalid request data (e.g., item is not a list type, cannot move to different board)
- **401 Unauthorized**: Invalid or missing JWT token
- **403 Forbidden**: Access denied (not workspace member)
- **404 Not Found**: Board/column/task not found
- **500 Internal Server Error**: Database errors

## Usage Examples

### Create Kanban Board with Columns and Tasks

```javascript
// 1. Create list item (automatically creates kanban board)
const item = await fetch('/playground/items', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    collectionId: 'collection-uuid',
    name: 'My Kanban Board',
    type: 'list'
  })
}).then(r => r.json());

// 2. Get the kanban board
const board = await fetch(`/playground/kanban/boards/${item.id}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
}).then(r => r.json());

// 3. Create columns
const todoColumn = await fetch('/playground/kanban/columns', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    kanbanBoardId: board.id,
    title: 'To Do',
    color: '#3b82f6'
  })
}).then(r => r.json());

const doneColumn = await fetch('/playground/kanban/columns', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    kanbanBoardId: board.id,
    title: 'Done',
    color: '#10b981'
  })
}).then(r => r.json());

// 4. Create tasks
const task = await fetch('/playground/kanban/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    kanbanColumnId: todoColumn.id,
    title: 'Design new UI',
    description: 'Create wireframes',
    priority: 'high',
    assigneeId: 'user-uuid',
    dueDate: '2025-12-31T23:59:59Z'
  })
}).then(r => r.json());

// 5. Create subtask
const subtask = await fetch('/playground/kanban/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    kanbanColumnId: todoColumn.id,
    title: 'Header layout',
    parentTaskId: task.id,
    priority: 'medium'
  })
}).then(r => r.json());

// 6. Move task to Done column
await fetch(`/playground/kanban/tasks/${task.id}/move`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    kanbanColumnId: doneColumn.id,
    position: 0
  })
});
```

### Get Full Kanban Board

```javascript
const getKanbanBoard = async (itemId) => {
  const board = await fetch(`/playground/kanban/boards/${itemId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }).then(r => r.json());

  // Board includes:
  // - columns (ordered by position)
  //   - tasks (ordered by position)
  //     - subtasks (if any)
  return board;
};
```

## Database Schema

### Entities

- **KanbanBoard**: One-to-one with Item (when type='list')
- **KanbanColumn**: Many-to-one with KanbanBoard
- **KanbanTask**: Many-to-one with KanbanColumn, self-referencing for subtasks

### Key Relationships

- Item (type='list') → KanbanBoard (one-to-one)
- KanbanBoard → KanbanColumns (one-to-many)
- KanbanColumn → KanbanTasks (one-to-many)
- KanbanTask → KanbanTasks (one-to-many, for subtasks via parentTaskId)

## Dependencies

- `KanbanService`: Business logic for kanban operations
- `PlaygroundService`: Access to items and workspace verification
- `JwtAuthGuard`: JWT authentication protection
- `TypeORM`: Database operations with kanban entities
- `Logger`: Application logging

