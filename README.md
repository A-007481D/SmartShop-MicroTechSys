# SmartShop - B2B Commercial Management System

SmartShop is a backend REST API designed for MicroTech Maroc to manage their B2B portfolio of over 650 clients. It handles client management, product inventory, order processing, and a sophisticated loyalty system with automated tier upgrades and discounts.

## Project Overview

This system is built to address the scalability needs of MicroTech Maroc, replacing manual processes with a robust, automated solution. It focuses on traceability, financial compliance, and customer loyalty retention.

### Key Features

*   **Client Management**: Comprehensive profile management with automated tracking of key metrics such as total orders, total spent, and order history.
*   **Loyalty System**: An automated engine that upgrades client tiers (Basic, Silver, Gold, Platinum) based on turnover and order frequency, applying progressive discounts (5%, 10%, 15%) automatically.
*   **Order Processing**: A streamlined workflow for Admin-driven order creation, including real-time stock validation and status management (Pending, Confirmed, Rejected).
*   **Financial Tracking**: Support for split payments via multiple methods (Cash, Check, Transfer) with strict validation rules, such as the 20,000 DH limit for cash transactions.
*   **Compliance & Security**: Implementation of strict business rules, such as requiring full payment before order confirmation, and Role-Based Access Control (RBAC) to separate Admin and Client privileges.

## Technology Stack

*   **Language**: Java 17
*   **Framework**: Spring Boot 4.0.0
*   **Database**: PostgreSQL 16
*   **Schema Migration**: Liquibase
*   **Testing**: JUnit 5, Mockito, JaCoCo
*   **Build Tool**: Maven
*   **Utilities**: Lombok, MapStruct

## Architecture

The project adheres to a strict Layered Architecture to ensure separation of concerns and maintainability:

1.  **Controller Layer** (`com.microtech.microtechsmartmgmt.controller`): Handles incoming HTTP requests, input validation, and response formatting. It utilizes a centralized `GlobalExceptionHandler` for consistent error reporting.
2.  **Service Layer** (`com.microtech.microtechsmartmgmt.service`): Encapsulates all business logic, including loyalty calculations, payment validations, and transaction management.
3.  **Repository Layer** (`com.microtech.microtechsmartmgmt.repository`): Manages data persistence and retrieval using Spring Data JPA.
4.  **Entity Layer** (`com.microtech.microtechsmartmgmt.entity`): Defines the domain model and database schema mapping.

### Database Schema Highlights
*   **Users**: Base table for authentication, using a Joined inheritance strategy for Clients.
*   **Clients**: Extends Users to include business-specific statistics (Tier, Turnover).
*   **Products**: Inventory items supporting Soft Delete to preserve historical data.
*   **Orders**: Central transactional entity linking Clients and Products.
*   **Payments**: Tracks financial transactions associated with orders.

## Setup and Installation

### Prerequisites
*   Java Development Kit (JDK) 17 or higher
*   PostgreSQL Database
*   Maven

### Installation Steps

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-repo/smartshop.git
    cd smartshop
    ```

2.  **Configure Database**
    Update the `src/main/resources/application.properties` file with your PostgreSQL credentials:
    ```properties
    spring.datasource.url=jdbc:postgresql://localhost:5432/microtech
    spring.datasource.username=postgres
    spring.datasource.password=your_password
    ```

3.  **Run the Application**
    ```bash
    ./mvnw spring-boot:run
    ```

4.  **Run Tests**
    Execute the full test suite including unit and integration tests:
    ```bash
    ./mvnw test
    ```

## API Documentation

The API follows RESTful principles and uses JSON for data exchange.

*   **Base URL**: `http://localhost:8080/api/v1`
*   **Authentication URL**: `http://localhost:8080/api/auth`

### Key Endpoints

#### Authentication
*   `POST /api/auth/login`: Authenticate as Admin or Client.

#### Products
*   `GET /api/v1/products`: List all active products (Paginated).

#### Orders
*   `POST /api/v1/orders`: Create a new order (Admin only).
*   `PUT /api/v1/orders/{id}/status`: Update order status (e.g., CONFIRM).

#### Payments
*   `POST /api/v1/orders/{id}/payments`: Add a payment to an order.
*   `GET /api/v1/orders/{id}/payments`: Retrieve payment history for an order.

#### Clients
*   `GET /api/clients/me`: Retrieve own profile and statistics (Client only).

## Testing Strategy

The project employs a dual-layer testing strategy:
1.  **Unit Tests**: JUnit and Mockito are used to verify core business logic in isolation, particularly for the Order, Client, and Payment services.
2.  **End-to-End (E2E) Tests**: Shell scripts (`test-api.sh`, `full_system_test.sh`) are provided to validate complete user flows and API interactions against a running instance.