# Playground Module

This module implements a hierarchical navigation system similar to ClickUp's spaces, allowing workspaces to organize content into collections, folders, and items (lists, documents, whiteboards).

## Overview

The Playground system provides a flexible hierarchy for organizing workspace content:

- **Collections** → Top-level containers belonging to a workspace
- **Folders** → Can be nested within collections or other folders
- **Items** → Can be lists (kanban boards), documents, or whiteboards

## Hierarchy Structure

```
Workspace
└── Collection (e.g., "ZenFlow")
    ├── Folder (e.g., "zenflow-frontend")
    │   ├── Folder (nested)
    │   └── Item (list/doc/whiteboard)
    ├── Folder
    └── Item (list/doc/whiteboard)
```

## Endpoints

### Collections

#### Create Collection

- **Endpoint**: `POST /playground/collections`
- **Description**: Create a new collection in a workspace
- **Authentication**: Required (JWT)
- **Request Body**:

```json
{
  "workspaceId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "ZenFlow",
  "iconType": "emoji",
  "icon": "🚀"
}
```

**Example Request**:

```javascript
fetch('/playground/collections', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <jwt-token>'
  },
  body: JSON.stringify({
    workspaceId: '550e8400-e29b-41d4-a716-446655440000',
    name: 'ZenFlow',
    iconType: 'emoji',
    icon: '🚀'
  })
});
```

**Response**:

```json
{
  "id": "collection-uuid",
  "workspaceId": "workspace-uuid",
  "name": "ZenFlow",
  "iconType": "emoji",
  "icon": "🚀",
  "position": 0,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

#### Get All Collections

- **Endpoint**: `GET /playground/collections?workspaceId=:id`
- **Description**: Get all collections for a workspace
- **Authentication**: Required (JWT)
- **Response**: Array of collection objects with nested folders and items

#### Get Collection with Hierarchy

- **Endpoint**: `GET /playground/collections/:id`
- **Description**: Get a collection with its full hierarchy
- **Authentication**: Required (JWT)
- **Response**: Collection object with all nested folders and items

#### Update Collection

- **Endpoint**: `PATCH /playground/collections/:id`
- **Description**: Update collection properties
- **Authentication**: Required (JWT)
- **Request Body**:

```json
{
  "name": "Updated Collection Name",
  "iconType": "emoji",
  "icon": "📁"
}
```

#### Delete Collection

- **Endpoint**: `DELETE /playground/collections/:id`
- **Description**: Delete collection and all nested content (cascade)
- **Authentication**: Required (JWT)
- **Response**: 204 No Content

#### Upload Collection Icon

- **Endpoint**: `POST /playground/collections/:id/icon`
- **Description**: Upload an image file as collection icon
- **Authentication**: Required (JWT)
- **Content-Type**: `multipart/form-data`
- **Request Body**: `icon: File`

#### Reorder Collection

- **Endpoint**: `PATCH /playground/collections/:id/reorder`
- **Description**: Change collection position within workspace
- **Authentication**: Required (JWT)
- **Request Body**:

```json
{
  "position": 2
}
```

### Folders

#### Create Folder

- **Endpoint**: `POST /playground/folders`
- **Description**: Create a folder in a collection or nested in another folder
- **Authentication**: Required (JWT)
- **Request Body**:

```json
{
  "collectionId": "collection-uuid",
  "name": "zenflow-frontend",
  "iconType": "emoji",
  "icon": "📂"
}
```

OR for nested folders:

```json
{
  "parentFolderId": "folder-uuid",
  "name": "components"
}
```

**Response**: Folder object with relations

#### Get Folder

- **Endpoint**: `GET /playground/folders/:id`
- **Description**: Get folder with all its children
- **Authentication**: Required (JWT)

#### Update Folder

- **Endpoint**: `PATCH /playground/folders/:id`
- **Description**: Update folder properties
- **Authentication**: Required (JWT)

#### Delete Folder

- **Endpoint**: `DELETE /playground/folders/:id`
- **Description**: Delete folder and all nested content (cascade)
- **Authentication**: Required (JWT)

#### Upload Folder Icon

- **Endpoint**: `POST /playground/folders/:id/icon`
- **Description**: Upload an image file as folder icon
- **Authentication**: Required (JWT)
- **Content-Type**: `multipart/form-data`

#### Move Folder

- **Endpoint**: `PATCH /playground/folders/:id/move`
- **Description**: Move folder to different collection or parent folder
- **Authentication**: Required (JWT)
- **Request Body**:

```json
{
  "collectionId": "new-collection-uuid",
  "position": 0
}
```

#### Reorder Folder

- **Endpoint**: `PATCH /playground/folders/:id/reorder`
- **Description**: Change folder position within its parent
- **Authentication**: Required (JWT)
- **Request Body**:

```json
{
  "position": 1
}
```

### Items

#### Create Item

- **Endpoint**: `POST /playground/items`
- **Description**: Create an item (list/doc/whiteboard). If type is "list", a kanban board is automatically created.
- **Authentication**: Required (JWT)
- **Request Body**:

```json
{
  "collectionId": "collection-uuid",
  "name": "My Kanban Board",
  "type": "list",
  "iconType": "emoji",
  "icon": "📋"
}
```

**Item Types**:
- `list` - Kanban board (automatically creates kanban_board record)
- `doc` - Document
- `whiteboard` - Whiteboard

**Response**: Item object with associated content

#### Get Item

- **Endpoint**: `GET /playground/items/:id`
- **Description**: Get item with its associated content (kanban board, document, or whiteboard)
- **Authentication**: Required (JWT)

#### Update Item

- **Endpoint**: `PATCH /playground/items/:id`
- **Description**: Update item properties
- **Authentication**: Required (JWT)

#### Delete Item

- **Endpoint**: `DELETE /playground/items/:id`
- **Description**: Delete item and its associated content
- **Authentication**: Required (JWT)

#### Upload Item Icon

- **Endpoint**: `POST /playground/items/:id/icon`
- **Description**: Upload an image file as item icon
- **Authentication**: Required (JWT)
- **Content-Type**: `multipart/form-data`

#### Move Item

- **Endpoint**: `PATCH /playground/items/:id/move`
- **Description**: Move item to different collection or folder
- **Authentication**: Required (JWT)

#### Reorder Item

- **Endpoint**: `PATCH /playground/items/:id/reorder`
- **Description**: Change item position within its parent
- **Authentication**: Required (JWT)

## Kanban Endpoints

See [Kanban Module README](./kanban/README.md) for detailed kanban board, column, and task endpoints.

### Quick Reference

- `POST /playground/kanban/boards` - Create kanban board for list item
- `GET /playground/kanban/boards/:itemId` - Get kanban board with columns and tasks
- `POST /playground/kanban/columns` - Create column
- `PATCH /playground/kanban/columns/:id` - Update column
- `DELETE /playground/kanban/columns/:id` - Delete column
- `POST /playground/kanban/tasks` - Create task
- `PATCH /playground/kanban/tasks/:id` - Update task
- `DELETE /playground/kanban/tasks/:id` - Delete task
- `PATCH /playground/kanban/tasks/:id/move` - Move task between columns

## Authentication

All endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

## Authorization Rules

### Workspace Access

- All operations require workspace membership (owner or member)
- Users can only access collections/folders/items within their workspaces
- Moving items/folders between workspaces is not allowed

### Operations

- **Workspace Members**: Can create, read, update, delete collections/folders/items
- **Non-members**: No access (403 Forbidden)

## Icon Management

### Icon Types

- **emoji**: String value (e.g., "🚀", "📁")
- **image**: File path after upload (e.g., "/uploads/icons/collection-xxx-timestamp.png")

### Icon Upload

Icons are uploaded via separate endpoints:
- `POST /playground/collections/:id/icon`
- `POST /playground/folders/:id/icon`
- `POST /playground/items/:id/icon`

**Supported Formats**: PNG, JPG, JPEG, GIF, WEBP

**Storage**: `/uploads/icons/{type}-{id}-{timestamp}.{ext}`

## Position Management

All entities support position-based ordering:

- Positions are 0-based integers
- Positions are automatically normalized after reordering
- New items are added at the end (max position + 1)

## Cascade Deletes

- Deleting a collection deletes all its folders and items
- Deleting a folder deletes all its nested folders and items
- Deleting an item deletes its associated content (kanban board, document, or whiteboard)

## Error Responses

- **400 Bad Request**: Invalid request data (e.g., missing required parent)
- **401 Unauthorized**: Invalid or missing JWT token
- **403 Forbidden**: Access denied (not workspace member)
- **404 Not Found**: Collection/folder/item not found
- **500 Internal Server Error**: Database or file system errors

## Usage Examples

### Create Collection Hierarchy

```javascript
// 1. Create collection
const collection = await fetch('/playground/collections', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    workspaceId: 'workspace-uuid',
    name: 'ZenFlow',
    iconType: 'emoji',
    icon: '🚀'
  })
}).then(r => r.json());

// 2. Create folder in collection
const folder = await fetch('/playground/folders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    collectionId: collection.id,
    name: 'zenflow-frontend',
    iconType: 'emoji',
    icon: '📂'
  })
}).then(r => r.json());

// 3. Create list item (automatically creates kanban board)
const item = await fetch('/playground/items', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    parentFolderId: folder.id,
    name: 'My Kanban Board',
    type: 'list',
    iconType: 'emoji',
    icon: '📋'
  })
}).then(r => r.json());
```

### Get Full Hierarchy

```javascript
const getCollectionHierarchy = async (collectionId) => {
  const collection = await fetch(`/playground/collections/${collectionId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }).then(r => r.json());

  // Collection includes:
  // - folders (with nested folders and items)
  // - items (direct items in collection)
  return collection;
};
```

### Move Item Between Folders

```javascript
const moveItem = async (itemId, targetFolderId) => {
  await fetch(`/playground/items/${itemId}/move`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      parentFolderId: targetFolderId,
      position: 0
    })
  });
};
```

## Database Schema

### Core Entities

- **Collection**: Collections belonging to workspaces
- **Folder**: Folders that can be nested
- **Item**: Items (list/doc/whiteboard) with type enum
- **KanbanBoard**: Kanban boards linked to list items
- **KanbanColumn**: Columns within kanban boards
- **KanbanTask**: Tasks with subtask support
- **Document**: Document content
- **Whiteboard**: Whiteboard content

### Key Relationships

- Workspace → Collections (one-to-many)
- Collection → Folders/Items (one-to-many)
- Folder → Folders/Items (one-to-many, self-referencing)
- Item → KanbanBoard/Document/Whiteboard (one-to-one, based on type)
- KanbanBoard → KanbanColumns (one-to-many)
- KanbanColumn → KanbanTasks (one-to-many)
- KanbanTask → KanbanTasks (one-to-many, for subtasks)

## Dependencies

- `PlaygroundService`: Business logic for collections, folders, and items
- `KanbanService`: Business logic for kanban operations
- `JwtAuthGuard`: JWT authentication protection
- `TypeORM`: Database operations with all playground entities
- `FileInterceptor`: Handles multipart file uploads
- `Logger`: Application logging

