# Authentication Module

This module handles user authentication, including Google OAuth login, JWT token management, and token refresh functionality.

## Endpoints

### Google OAuth Login
- **Endpoint**: `GET /auth/google`
- **Description**: Initiate Google OAuth login flow
- **Authentication**: None required
- **Response**: Redirects to Google OAuth consent screen

### Google OAuth Callback
- **Endpoint**: `GET /auth/google/callback`
- **Description**: Handle Google OAuth callback
- **Authentication**: None required (handled by OAuth flow)
- **Response**: JWT tokens and user profile

**Response**:
```json
{
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://lh3.googleusercontent.com/...",
    "onboarded": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "accessExpires": 1700123456,
  "refreshExpires": 1700728256,
  "nextStep": "boarding"
}
```

### Refresh Access Token
- **Endpoint**: `POST /auth/refresh`
- **Description**: Refresh JWT access token using refresh token
- **Authentication**: Valid refresh token required
- **Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "accessExpires": 1700123456
}
```

## Authentication Flow

### Google OAuth Flow
1. User initiates login via `GET /auth/google`
2. User is redirected to Google OAuth consent screen
3. User authorizes the application
4. Google redirects to `/auth/google/callback` with authorization code
5. Server exchanges code for user profile and tokens
6. Server creates/updates user account and generates JWT tokens
7. Server returns tokens and user profile

### Token Refresh Flow
1. Client sends refresh token to `/auth/refresh`
2. Server validates refresh token and checks expiry
3. Server generates new access token
4. Server returns new access token with new expiry

## JWT Token Structure

### Access Token
- **Type**: JWT
- **Expiry**: 7 days
- **Payload**:
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "type": "access",
  "iat": 1700123456,
  "exp": 1700728256
}
```

### Refresh Token
- **Type**: JWT
- **Expiry**: 30 days
- **Payload**:
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "type": "refresh",
  "iat": 1700123456,
  "exp": 1706728256
}
```

## Security Features

### Token Validation
- JWT tokens are validated on every protected route
- Access tokens automatically refresh when expired (if refresh token is valid)
- Invalid tokens are rejected with 401 Unauthorized

### Account Management
- Google accounts are linked to user profiles via Account entity
- Refresh tokens are stored securely in database
- Automatic cleanup of expired tokens

## Error Responses

- **400 Bad Request**: Invalid refresh token or malformed request
- **401 Unauthorized**: Token expired, invalid, or missing
- **403 Forbidden**: Account disabled or suspended
- **500 Internal Server Error**: Token generation or database errors

## Usage Examples

### Frontend Login
```javascript
// Redirect to Google OAuth
window.location.href = '/auth/google';

// Handle callback (usually handled by OAuth redirect)
// Tokens are automatically stored in response
```

### Token Refresh
```javascript
const refreshTokens = async (refreshToken) => {
  const response = await fetch('/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refreshToken })
  });
  
  const { accessToken, accessExpires } = await response.json();
  // Store new access token
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('accessExpires', accessExpires);
};
```

## Dependencies

- `AuthService`: Core authentication business logic
- `JwtStrategy`: JWT authentication strategy
- `GoogleStrategy`: Google OAuth strategy
- `JwtRefreshStrategy`: JWT refresh token strategy
- `TypeORM`: Database operations with User and Account entities
