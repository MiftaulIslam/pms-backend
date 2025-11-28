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

### 📁 File Management
- Avatar uploads for users
- Workspace logo uploads
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

## Database Schema

### Core Entities
- **User**: User profiles and authentication
- **Account**: Linked OAuth accounts
- **Workspace**: Workspaces with ownership
- **WorkspaceMember**: Workspace membership with roles
- **WorkspaceInvitation**: Pending workspace invitations

### Key Relationships
- Users can own multiple workspaces
- Users can be members of multiple workspaces
- Workspaces have one owner and multiple members
- Each membership has a role (OWNER, MEMBER)

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
