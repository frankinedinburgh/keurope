# Keurope Backend - Java

Spring Boot port of the Go API in `../backend`. Same routes, same JSON shapes, same SQLite schema, and JWTs are interchangeable between the two.

## Run

```bash
./mvnw spring-boot:run          # http://localhost:5000
./mvnw test                     # integration tests (temp DB)
```

Swagger UI: http://localhost:5000/docs

| Env var          | Default                       |
|------------------|-------------------------------|
| `PORT`           | `5000`                        |
| `DB_PATH`        | `./keurope.db`                |
| `JWT_SECRET`     | `your-secret-key-change-this` |
| `ADMIN_PASSWORD` | `admin123`                    |

## Layout

| Go file                          | Java                                                   |
|----------------------------------|--------------------------------------------------------|
| `main.go` (routes, middleware)   | `config/WebConfig`, `config/CorsFilter`, `@*Mapping`s  |
| `database.go` (schema, seed)     | `config/DatabaseInitializer`, `*Repository`            |
| `data.go`                        | `resources/seed/products.json`                         |
| `auth.go`, `users.go`            | `auth/`                                                |
| `cart.go`, `cart_handlers.go`    | `cart/`                                                |
| `handlers.go` (products, orders) | `product/`, `order/`                                   |
| `admin.go`                       | `admin/`, `product/AdminProductController`             |
