package com.microtech.microtechsmartmgmt.service;

import com.microtech.microtechsmartmgmt.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface ProductService {

    Product createProduct(Product product);

    Product updateProduct(Long id, Product product);

    void deleteProduct(Long id);

    Optional<Product> getProductById(Long id);

    Page<Product> getAllProducts(Pageable pageable);

    Page<Product> getActiveProducts(Pageable pageable);

    boolean isProductUsedInOrders(Long productId);
}

