# Keurope Backend - Go

REST API for the Keurope e-commerce platform, built in Go.

## Setup

```bash
cd /home/frank/Sites/keurope/backend
go get github.com/gorilla/mux
```

## Run

```bash
go run .
```

Server starts on `http://localhost:5000`

## Endpoints

### Get all products
```bash
curl http://localhost:5000/api/products
```

### Filter by category
```bash
curl http://localhost:5000/api/products?category=Tops
```

### Get single product
```bash
curl http://localhost:5000/api/products/1
```

### Get categories
```bash
curl http://localhost:5000/api/categories
```

## Files

- `main.go` - Entry point and router setup
- `models.go` - Data structures
- `data.go` - Sample product data
- `handlers.go` - Route handlers
- `go.mod` - Go module definition

## Next Steps

- Phase 2: Add POST/PUT/DELETE endpoints
- Phase 3: Add database integration (PostgreSQL)
- Phase 4: Add authentication
