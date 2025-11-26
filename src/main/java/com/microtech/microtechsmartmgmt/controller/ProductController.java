package com.microtech.microtechsmartmgmt.controller;

import com.microtech.microtechsmartmgmt.entity.Product;
import com.microtech.microtechsmartmgmt.enums.UserRole;
import com.microtech.microtechsmartmgmt.security.RequireRole;
import com.microtech.microtechsmartmgmt.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping("/admin/products")
    @RequireRole(UserRole.ADMIN)
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product product) {
        Product created = productService.createProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/admin/products/{id}")
    @RequireRole(UserRole.ADMIN)
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody Product product) {
        Product updated = productService.updateProduct(id, product);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/admin/products/{id}")
    @RequireRole(UserRole.ADMIN)
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/products")
    @RequireRole(UserRole.ADMIN)
    public ResponseEntity<Page<Product>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productService.getAllProducts(pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/admin/products/{id}")
    @RequireRole(UserRole.ADMIN)
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @GetMapping("/products")
    @RequireRole(UserRole.CLIENT)
    public ResponseEntity<Page<Product>> getActiveProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productService.getActiveProducts(pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/{id}")
    @RequireRole(UserRole.CLIENT)
    public ResponseEntity<Product> getProductByIdForClient(@PathVariable Long id) {
        return productService.getProductById(id)
                .filter(product -> !product.isDeleted() && product.isActive())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

