# Role-Based Authentication System

## Overview
Your application implements a comprehensive role-based authentication system that separates users into three distinct roles: **ADMIN**, **CLIENT**, and **USER**.

## How Role Separation Works

### 1. Role Definition (`UserRole.java`)
```java
public enum UserRole {
    ADMIN,   // Full system access
    CLIENT,  // Business client access  
    USER     // Basic user access
}
```

### 2. User Entity (`User.java`)
- Each user has a `role` field of type `UserRole`
- Role is stored in the database as a string (EnumType.STRING)
- Role determines what endpoints the user can access

### 3. Authentication Flow
1. User logs in via `/api/auth/login`
2. System validates credentials
3. Upon success, user object (including role) is stored in HTTP session
4. Session persists across requests until logout

### 4. Authorization Mechanism

#### `@RequireRole` Annotation
```java
@RequireRole({UserRole.ADMIN})        // Admin only
@RequireRole({UserRole.CLIENT})       // Client only  
@RequireRole({UserRole.USER})         // User only
@RequireRole({UserRole.ADMIN, UserRole.CLIENT})  // Admin OR Client
```

#### `AuthInterceptor` 
- Intercepts all API requests (except auth endpoints)
- Checks if endpoint has `@RequireRole` annotation
- Validates user session exists
- Compares user's role with required roles
- Throws `BusinessException` if access denied

### 5. Role Hierarchy & Permissions

#### ADMIN
- **Purpose**: System administrators
- **Access**: Full system access
- **Endpoints**: 
  - `/api/admin/*` - Admin dashboard, user management, system settings
  - All other role endpoints (if needed)

#### CLIENT  
- **Purpose**: Business clients/customers
- **Access**: Client-specific features
- **Endpoints**:
  - `/api/client/*` - Client dashboard, orders, business features
  - Shared endpoints with other roles

#### USER
- **Purpose**: Basic/regular users
- **Access**: Limited to basic features
- **Endpoints**:
  - `/api/user/*` - User dashboard, basic features
  - Shared endpoints with other roles

### 6. Implementation Examples

#### Admin-Only Endpoint
```java
@GetMapping("/api/admin/users")
@RequireRole({UserRole.ADMIN})
public ResponseEntity<?> getAllUsers() {
    // Only admins can access
}
```

#### Multi-Role Endpoint  
```java
@GetMapping("/api/notifications")
@RequireRole({UserRole.USER, UserRole.CLIENT, UserRole.ADMIN})
public ResponseEntity<?> getNotifications() {
    // All authenticated users can access
}
```

#### Public Endpoint (No annotation)
```java
@GetMapping("/api/public/info")
public ResponseEntity<?> getPublicInfo() {
    // Anyone can access (no authentication required)
}
```

## Security Configuration

### WebConfig (`WebConfig.java`)
- Registers `AuthInterceptor` for all `/api/**` paths
- Excludes authentication endpoints (`/api/auth/**`)
- Excludes documentation endpoints (Swagger)

### Session Management (`SessionUtils.java`)
- Stores user object in HTTP session
- Provides utilities to check login status
- Retrieves user information from session

## How to Use in Controllers

1. **Add the annotation** to your controller method
2. **Specify required roles** in the annotation value
3. **The interceptor automatically handles** the authorization

```java
@RestController
@RequestMapping("/api/products")
public class ProductController {
    
    @GetMapping("/")  // Public - no annotation needed
    public ResponseEntity<?> getProducts() { }
    
    @PostMapping("/")  // Admin only
    @RequireRole({UserRole.ADMIN})
    public ResponseEntity<?> createProduct() { }
    
    @GetMapping("/my-orders")  // Client only
    @RequireRole({UserRole.CLIENT})  
    public ResponseEntity<?> getMyOrders() { }
    
    @GetMapping("/profile")  // Multiple roles
    @RequireRole({UserRole.CLIENT, UserRole.ADMIN})
    public ResponseEntity<?> getProfile() { }
}
```

## Error Responses

- **401 Unauthorized**: User not logged in
- **403 Forbidden**: User logged in but insufficient permissions

The system automatically handles these cases and returns appropriate HTTP status codes with error messages.
