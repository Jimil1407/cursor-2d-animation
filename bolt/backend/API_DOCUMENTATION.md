# Backend API Documentation

This document provides detailed information about the backend API endpoints, their request/response formats, and usage examples.

## Base URL

All API endpoints are prefixed with: `http://localhost:8000`

## Authentication

Most endpoints require authentication. Include the Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase_id_token>
```

## Endpoints

### Animation Management

#### Create Animation
```http
POST /api/animation/create
```

Request Body:
```json
{
    "title": "string",
    "description": "string",
    "content": {
        "scenes": [
            {
                "elements": [],
                "duration": 0
            }
        ]
    }
}
```

Response:
```json
{
    "id": "string",
    "title": "string",
    "description": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
}
```

#### Get Animation
```http
GET /api/animation/{id}
```

Response:
```json
{
    "id": "string",
    "title": "string",
    "description": "string",
    "content": {
        "scenes": []
    },
    "created_at": "timestamp",
    "updated_at": "timestamp"
}
```

#### Update Animation
```http
PUT /api/animation/{id}
```

Request Body:
```json
{
    "title": "string",
    "description": "string",
    "content": {
        "scenes": []
    }
}
```

Response:
```json
{
    "id": "string",
    "title": "string",
    "description": "string",
    "updated_at": "timestamp"
}
```

#### Delete Animation
```http
DELETE /api/animation/{id}
```

Response:
```json
{
    "message": "Animation deleted successfully"
}
```

### User Management

#### Get User Profile
```http
GET /api/user/profile
```

Response:
```json
{
    "id": "string",
    "email": "string",
    "display_name": "string",
    "created_at": "timestamp"
}
```

### Payment Integration

#### Create Payment
```http
POST /api/payment/create
```

Request Body:
```json
{
    "amount": "number",
    "currency": "string",
    "description": "string"
}
```

Response:
```json
{
    "order_id": "string",
    "amount": "number",
    "currency": "string",
    "payment_url": "string"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
    "error": "string",
    "message": "string"
}
```

### 401 Unauthorized
```json
{
    "error": "Unauthorized",
    "message": "Invalid or missing authentication token"
}
```

### 404 Not Found
```json
{
    "error": "Not Found",
    "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
    "error": "Internal Server Error",
    "message": "An unexpected error occurred"
}
```

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## WebSocket Endpoints

### Animation Preview
```http
WS /ws/animation/{id}/preview
```

Messages:
```json
{
    "type": "preview_update",
    "data": {
        "frame": "number",
        "content": {}
    }
}
```

## Development Notes

1. All timestamps are in ISO 8601 format
2. All monetary values are in the smallest currency unit (e.g., cents for USD)
3. File uploads are limited to 10MB per file
4. Maximum animation duration is 5 minutes 