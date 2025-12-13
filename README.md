# PMS Backend API Documentation

Project Management System (PMS) backend API with comprehensive workspace management, user authentication, and collaboration features.

## Overview

This NestJS-based backend provides a complete API for project management with the following core features:
- **Authentication**: Google OAuth integration with JWT token management
- **User Management**: Profile management, onboarding, and avatar handling
- **Workspace Management**: Create, manage, and collaborate in workspaces
- **File Management**: Avatar and workspace logo uploads with static file serving
- **Role-Based Access**: Owner/member permissions and workspace security

## Base URL

```
http://localhost:9000
```

## Authentication

All protected endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

### Token Types
- **Access Token**: 7 days expiry, used for API requests
- **Refresh Token**: 30 days expiry, used to refresh access tokens

## API Endpoints Summary

### Authentication (`/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/auth/google` | Initiate Google OAuth | No |
| `GET` | `/auth/google/callback` | Handle OAuth callback | No |
| `POST` | `/auth/refresh` | Refresh access token | No (refresh token in body) |

### Users (`/users`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/users/me` | Get current user profile | Yes |
| `GET` | `/users/:id` | Get user by ID | Yes |
| `PATCH` | `/users/profile` | Update user profile | Yes |

### Onboarding (`/users/boarding`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/users/boarding/complete` | Complete user onboarding | Yes |

### Workspaces (`/workspaces`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/workspaces` | Create workspace | Yes |
| `GET` | `/workspaces` | Get all workspaces (admin) | Yes |
| `GET` | `/workspaces/my` | Get my workspaces | Yes |
| `GET` | `/workspaces/last` | Get last active workspace | Yes |
| `GET` | `/workspaces/:id` | Get workspace details | Yes |
| `GET` | `/workspaces/:id/members` | Get workspace members | Yes |
| `PATCH` | `/workspaces/:id` | Update workspace | Yes |
| `DELETE` | `/workspaces/:id` | Delete workspace | Yes |
| `POST` | `/workspaces/:id/leave` | Leave workspace | Yes |
| `POST` | `/workspaces/:id/logo` | Update workspace logo | Yes |
| `DELETE` | `/workspaces/:id/logo` | Remove workspace logo | Yes |

### Playground (`/playground`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/playground/collections` | Create collection | Yes |
| `GET` | `/playground/collections` | Get all collections for workspace | Yes |
| `GET` | `/playground/collections/:id` | Get collection with hierarchy | Yes |
| `PATCH` | `/playground/collections/:id` | Update collection | Yes |
| `DELETE` | `/playground/collections/:id` | Delete collection | Yes |
| `POST` | `/playground/collections/:id/icon` | Upload collection icon | Yes |
| `PATCH` | `/playground/collections/:id/reorder` | Reorder collection | Yes |
| `POST` | `/playground/folders` | Create folder | Yes |
| `GET` | `/playground/folders/:id` | Get folder with children | Yes |
| `PATCH` | `/playground/folders/:id` | Update folder | Yes |
| `DELETE` | `/playground/folders/:id` | Delete folder | Yes |
| `POST` | `/playground/folders/:id/icon` | Upload folder icon | Yes |
| `PATCH` | `/playground/folders/:id/move` | Move folder | Yes |
| `PATCH` | `/playground/folders/:id/reorder` | Reorder folder | Yes |
| `POST` | `/playground/items` | Create item (list/doc/whiteboard) | Yes |
| `GET` | `/playground/items/:id` | Get item details | Yes |
| `PATCH` | `/playground/items/:id` | Update item | Yes |
| `DELETE` | `/playground/items/:id` | Delete item | Yes |
| `POST` | `/playground/items/:id/icon` | Upload item icon | Yes |
| `PATCH` | `/playground/items/:id/move` | Move item | Yes |
| `PATCH` | `/playground/items/:id/reorder` | Reorder item | Yes |

### Kanban (`/playground/kanban`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/playground/kanban/boards` | Create kanban board | Yes |
| `GET` | `/playground/kanban/boards/:itemId` | Get kanban board | Yes |
| `POST` | `/playground/kanban/columns` | Create column | Yes |
| `PATCH` | `/playground/kanban/columns/:id` | Update column | Yes |
| `DELETE` | `/playground/kanban/columns/:id` | Delete column | Yes |
| `POST` | `/playground/kanban/tasks` | Create task | Yes |
| `PATCH` | `/playground/kanban/tasks/:id` | Update task | Yes |
| `DELETE` | `/playground/kanban/tasks/:id` | Delete task | Yes |
| `PATCH` | `/playground/kanban/tasks/:id/move` | Move task | Yes |

## Key Features

### 🚀 Google OAuth Integration
- Seamless Google authentication
- Automatic user account creation
- JWT token management with refresh support

### 👤 User Management
- Complete user profiles with avatars
- Onboarding process with workspace creation
- Profile updates and management

### 🏢 Workspace Management
- Create and manage workspaces
- Role-based access control (Owner/Member)
- Last workspace tracking for seamless UX
- Workspace logo support

### 🎮 Playground System
- Hierarchical organization: Collections → Folders → Items
- Collections belong to workspaces
- Folders can be nested within collections or other folders
- Items can be lists (kanban boards), documents, or whiteboards
- Icon support (emoji or image upload)
- Position-based ordering with drag-and-drop support
- Move and reorder operations for all entities

### 📁 File Management
- Avatar uploads for users
- Workspace logo uploads
- Collection/folder/item icon uploads
- Automatic file naming and organization
- Static file serving via `/uploads/` route

### 🔐 Security Features
- JWT-based authentication
- Role-based authorization
- Automatic token refresh
- Secure file handling

## File Upload Specifications

### User Avatars
- **Endpoint**: During onboarding (`/users/boarding/complete`)
- **Storage**: `/uploads/avatars/{userId}.{ext}`
- **Naming**: `{userId}.{original-extension}`
- **Access**: `/uploads/avatars/{userId}.{ext}`

### Workspace Logos
- **Endpoint**: `POST /workspaces/:id/logo`
- **Storage**: `/uploads/workspace-logos/{name}-{timestamp}.{ext}`
- **Naming**: `{workspace-name}-{timestamp}.{extension}`
- **Access**: `/uploads/workspace-logos/{name}-{timestamp}.{ext}`

### Collection/Folder/Item Icons
- **Endpoints**: 
  - `POST /playground/collections/:id/icon`
  - `POST /playground/folders/:id/icon`
  - `POST /playground/items/:id/icon`
- **Storage**: `/uploads/icons/{type}-{id}-{timestamp}.{ext}`
- **Naming**: `{type}-{entity-id}-{timestamp}.{extension}`
- **Access**: `/uploads/icons/{type}-{id}-{timestamp}.{ext}`
- **Supported Types**: `collection`, `folder`, `item`

## Database Schema

### Core Entities
- **User**: User profiles and authentication
- **Account**: Linked OAuth accounts
- **Workspace**: Workspaces with ownership
- **WorkspaceMember**: Workspace membership with roles
- **WorkspaceInvitation**: Pending workspace invitations
- **Collection**: Top-level containers in workspaces
- **Folder**: Nested folders within collections or other folders
- **Item**: Items (list/doc/whiteboard) within collections or folders
- **KanbanBoard**: Kanban boards for list items
- **KanbanColumn**: Columns within kanban boards
- **KanbanTask**: Tasks with subtask support
- **Document**: Document content
- **Whiteboard**: Whiteboard content

### Key Relationships
- Users can own multiple workspaces
- Users can be members of multiple workspaces
- Workspaces have one owner and multiple members
- Each membership has a role (OWNER, MEMBER)
- Workspaces contain multiple collections
- Collections contain folders and items
- Folders can be nested and contain items
- Items can be lists (kanban), documents, or whiteboards
- List items automatically create kanban boards
- Kanban boards contain columns
- Columns contain tasks
- Tasks can have subtasks (self-referencing)

## Error Handling

### Standard Error Responses
```json
{
  "message": "Error description",
  "error": "Error type",
  "statusCode": 400
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **204**: No Content (successful delete)
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

## Development

### Environment Variables
```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=PMS
DATABASE_PASSWORD=ariyan
DATABASE_NAME=pms
JWT_SECRET=your-jwt-secret
```

### Project setup

```bash
$ yarn install
```

### Running the Application

```bash
# development
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

### Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

### Database Setup
The application uses TypeORM with MySQL. Database tables are automatically created/synchronized on startup.

## API Usage Examples

### Complete Authentication Flow
```javascript
// 1. Initiate Google OAuth
window.location.href = 'http://localhost:9000/auth/google';

// 2. Handle OAuth callback (redirected by Google)
// Tokens are returned in the response

// 3. Store tokens
localStorage.setItem('accessToken', response.accessToken);
localStorage.setItem('refreshToken', response.refreshToken);

// 4. Make authenticated requests
const response = await fetch('http://localhost:9000/users/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
});
```

### Create Workspace with Logo
```javascript
const createWorkspace = async (name, logoFile) => {
  const formData = new FormData();
  formData.append('name', name);
  if (logoFile) formData.append('logo', logoFile);

  const response = await fetch('http://localhost:9000/workspaces', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });

  return await response.json();
};
```

### Get User's Workspaces with Last Workspace
```javascript
const getMyWorkspaces = async () => {
  const response = await fetch('http://localhost:9000/workspaces/my', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });

  const { workspaces, lastWorkspaceId } = await response.json();
  
  // Redirect to last workspace if available
  if (lastWorkspaceId) {
    window.location.href = `/workspace/${lastWorkspaceId}`;
  }
  
  return workspaces;
};
```

## Technology Stack

- **Framework**: NestJS
- **Database**: MySQL with TypeORM
- **Authentication**: JWT + Google OAuth
- **File Handling**: Multer
- **Documentation**: Swagger/OpenAPI
- **Validation**: Built-in NestJS validation
- **Testing**: Jest

## License

This project is licensed under the MIT License.
