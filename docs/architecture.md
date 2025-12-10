# System Architecture - SmartShop

## Overview
SmartShop is built as a monolithic Spring Boot application using a layered architecture pattern. This ensures separation of concerns, maintainability, and testability.

## Layers

### 1. Presentation Layer (Controllers)
*   **Responsibility**: Handle incoming HTTP requests, validate input (DTOs), and return appropriate HTTP responses.
*   **Key Components**:
    *   `AuthController`: Login/Logout.
    *   `OrderController`: Order management endpoints.
    *   `ClientController`: Client profile and stats.
    *   `ProductController`: Catalog management.
*   **Security**: `AuthInterceptor` intercepts requests to enforce Role-Based Access Control (RBAC) using `@RequireRole` annotations.

### 2. Business Logic Layer (Services)
*   **Responsibility**: Implement core business rules, calculations, and transaction management.
*   **Key Services**:
    *   `OrderService`: Calculates totals, discounts, taxes; manages stock decrement; updates client stats.
    *   `ClientService`: Manages profile updates and tier recalculation.
    *   `PaymentService`: Validates payment rules (e.g., max cash limit) and updates order balance.
    *   `ProductService`: Handles CRUD and soft-delete logic.

### 3. Data Access Layer (Repositories)
*   **Responsibility**: Abstract database interactions.
*   **Technology**: Spring Data JPA interfaces extending `JpaRepository`.

### 4. Domain Model (Entities)
*   **Responsibility**: Map Java objects to PostgreSQL tables.
*   **Key Entities**: `User`, `Client`, `Order`, `Product`, `Payment`.
*   **Inheritance**: `Client` extends `User` (Joined Table strategy).

## Key Workflows

### Order Confirmation Flow
1.  **Admin** requests confirmation (`PUT /orders/{id}/status?status=CONFIRMED`).
2.  **OrderService** checks:
    *   Is status `PENDING`?
    *   Is `remainingBalance == 0`? (Must be fully paid).
    *   Is stock sufficient for all items?
3.  **If Valid**:
    *   Decrement stock for each product.
    *   Update Client stats (`totalOrders`, `totalSpent`).
    *   Recalculate Client Tier.
    *   Update Order status to `CONFIRMED`.
    *   Commit transaction.

### Loyalty System
*   **Trigger**: Occurs automatically when an order is confirmed.
*   **Logic**:
    *   **Silver**: 3+ orders OR 1,000+ DH.
    *   **Gold**: 10+ orders OR 5,000+ DH.
    *   **Platinum**: 20+ orders OR 15,000+ DH.
*   **Effect**: Applied to *future* orders as a discount on the subtotal.
