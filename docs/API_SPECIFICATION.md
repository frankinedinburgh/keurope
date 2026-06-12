# Keurope API Specification

**Version**: 1.0.0  
**Base URL**: `http://localhost:5000/api` (development) | `https://api.keurope.ie/api` (production)

## Overview

Keurope API provides endpoints for product browsing, cart management, order creation, and authentication. All responses follow a consistent format with type-safe discriminated unions.

## Response Format

All API responses follow this format:

```typescript
// Success Response
{
  "status": "success",
  "data": <T>
}

// Error Response
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { /* optional additional info */ }
  }
}
```

## Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `UNAUTHORIZED` | 401 | Auth token missing or invalid |
| `FORBIDDEN` | 403 | User lacks permission |
| `SERVER_ERROR` | 500 | Internal server error |
| `DB_ERROR` | 500 | Database error |

## Authentication

Protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <supabase_jwt_token>
```

## Endpoints

### Products

#### GET `/products`

List products with optional filtering and sorting.

**Query Parameters:**
| Name | Type | Optional | Default | Description |
|------|------|----------|---------|-------------|
| `category` | string | Yes | - | Filter by category: `tops`, `dresses`, `trousers`, `outerwear` |
| `search` | string | Yes | - | Search in title and description |
| `sort` | string | Yes | `created_at_desc` | Sort by: `created_at_asc`, `created_at_desc`, `price_asc`, `price_desc` |
| `page` | number | Yes | 1 | Page number for pagination |
| `limit` | number | Yes | 20 | Items per page (max 100) |

**Response:**
```typescript
{
  "status": "success",
  "data": {
    "items": Product[],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 42,
      "totalPages": 3
    }
  }
}
```

**Example:**
```bash
GET /products?category=dresses&sort=price_asc&page=1&limit=10
```

---

#### GET `/products/:id`

Get a specific product by ID.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `id` | string | Product ID (e.g., `prod_001`) |

**Response:**
```typescript
{
  "status": "success",
  "data": {
    "id": "prod_001",
    "title": "Silk Hanbok Dress",
    "description": "Traditional Korean hanbok-inspired dress in premium silk",
    "price": 89.99,
    "category": "dresses",
    "sizes": ["XS", "S", "M", "L", "XL"],
    "colors": ["red", "navy", "black"],
    "image_url": "/images/bach-tran.jpg",
    "stock_quantity": 15,
    "created_at": "2026-06-02T10:30:00Z",
    "updated_at": "2026-06-02T10:30:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "status": "error",
  "error": {
    "code": "NOT_FOUND",
    "message": "Product not found"
  }
}
```

---

#### GET `/categories`

Get all product categories with item counts.

**Response:**
```typescript
{
  "status": "success",
  "data": [
    { "name": "tops", "count": 12 },
    { "name": "dresses", "count": 18 },
    { "name": "trousers", "count": 8 },
    { "name": "outerwear", "count": 4 }
  ]
}
```

---

### Cart

#### POST `/cart`

Create or get a cart session.

**Request Body:**
```typescript
{
  "session_id"?: string  // Optional: existing session to connect to
}
```

**Response:**
```typescript
{
  "status": "success",
  "data": {
    "id": "session_123456",
    "items": [],
    "total_price": 0,
    "created_at": "2026-06-02T10:30:00Z",
    "updated_at": "2026-06-02T10:30:00Z"
  }
}
```

---

#### GET `/cart/:session_id`

Get cart contents.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `session_id` | string | Cart session ID |

**Response:**
```typescript
{
  "status": "success",
  "data": {
    "id": "session_123456",
    "items": [
      {
        "id": "item_001",
        "product_id": "prod_001",
        "quantity": 2,
        "size": "M",
        "color": "black",
        "price_at_time": 89.99
      }
    ],
    "total_price": 179.98,
    "created_at": "2026-06-02T10:30:00Z",
    "updated_at": "2026-06-02T10:30:00Z"
  }
}
```

---

#### POST `/cart/:session_id/items`

Add an item to cart.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `session_id` | string | Cart session ID |

**Request Body:**
```typescript
{
  "product_id": string,    // Required: e.g., "prod_001"
  "quantity": number,      // Required: 1+
  "size": string,          // Required: e.g., "M"
  "color": string          // Required: e.g., "black"
}
```

**Response:** Full cart after addition

**Validation Errors (400):**
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": {
      "quantity": "Must be at least 1",
      "size": "Invalid size for this product"
    }
  }
}
```

---

#### DELETE `/cart/:session_id/items/:item_id`

Remove item from cart.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `session_id` | string | Cart session ID |
| `item_id` | string | Cart item ID to remove |

**Response:** Full cart after removal

---

#### PUT `/cart/:session_id/items/:item_id`

Update item quantity in cart.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `session_id` | string | Cart session ID |
| `item_id` | string | Cart item ID to update |

**Request Body:**
```typescript
{
  "quantity": number  // Required: 1-999
}
```

**Response:** Full cart after update

---

### Orders

#### POST `/orders`

Create an order from cart items.

**Request Body:**
```typescript
{
  "customer_name": string,      // Required
  "customer_email": string,     // Required: valid email
  "customer_address": string,   // Required
  "customer_phone"?: string,    // Optional
  "items": [
    {
      "product_id": string,     // Required
      "quantity": number,       // Required
      "size": string,           // Required
      "color": string,          // Required
      "price": number           // Required: price at time of order
    }
  ],
  "total_price": number         // Required: calculated total
}
```

**Response:**
```typescript
{
  "status": "success",
  "data": {
    "id": "order_1717328400000",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_address": "123 Main St",
    "customer_phone": "+353 1 234 5678",
    "total_price": 179.98,
    "status": "pending",
    "items": [
      {
        "id": "item_001",
        "order_id": "order_1717328400000",
        "product_id": "prod_001",
        "quantity": 2,
        "size": "M",
        "color": "black",
        "price_at_purchase": 89.99
      }
    ],
    "created_at": "2026-06-02T10:30:00Z",
    "updated_at": "2026-06-02T10:30:00Z"
  }
}
```

**Validation Errors (400):**
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid order",
    "details": {
      "customer_email": "Invalid email format",
      "items": "Cart is empty"
    }
  }
}
```

---

#### GET `/orders/:id`

Get order details by ID.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `id` | string | Order ID |

**Requires Auth:** ✓ Yes

**Response:** Full order with items (see POST response)

**Error (404):**
```json
{
  "status": "error",
  "error": {
    "code": "NOT_FOUND",
    "message": "Order not found"
  }
}
```

---

### Newsletter

#### POST `/newsletter/subscribe`

Subscribe email to newsletter.

**Request Body:**
```typescript
{
  "email": string  // Required: valid email
}
```

**Response:**
```typescript
{
  "status": "success",
  "data": {
    "message": "Successfully subscribed to newsletter"
  }
}
```

**Error (409):** Already subscribed
```json
{
  "status": "error",
  "error": {
    "code": "CONFLICT",
    "message": "Email already subscribed"
  }
}
```

---

## Rate Limiting

Not implemented in MVP, but planned for production:
- 100 requests per minute per IP (unauthenticated)
- 1000 requests per minute per user (authenticated)

## CORS

CORS enabled for:
- Development: `localhost:5173`, `localhost:5174`
- Production: `keurope.ie`, `www.keurope.ie`

## Pagination

Endpoints that return lists support pagination:

```typescript
{
  "items": T[],
  "pagination": {
    "page": number,        // Current page (1-indexed)
    "limit": number,       // Items per page
    "total": number,       // Total items in collection
    "totalPages": number   // Total pages
  }
}
```

## Timestamps

All timestamps are ISO 8601 format:
```
2026-06-02T10:30:00Z
```

## Data Types

### Product
```typescript
interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: "tops" | "dresses" | "trousers" | "outerwear";
  sizes: string[];
  colors: string[];
  image_url: string;
  stock_quantity: number;
  created_at: string;  // ISO 8601
  updated_at: string;  // ISO 8601
}
```

### CartItem
```typescript
interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  size: string;
  color: string;
  price_at_time: number;
}
```

### Order
```typescript
interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_address: string;
  customer_phone?: string;
  total_price: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-06-02 | Initial API specification |

---

**Last Updated:** 2026-06-02

For questions or issues, see the GitHub issues or contact the development team.
