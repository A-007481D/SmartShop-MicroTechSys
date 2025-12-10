package com.microtech.microtechsmartmgmt.service.impl;

import com.microtech.microtechsmartmgmt.entity.Product;
import com.microtech.microtechsmartmgmt.exception.BusinessRuleViolationException;
import com.microtech.microtechsmartmgmt.exception.ResourceNotFoundException;
import com.microtech.microtechsmartmgmt.repository.OrderItemRepository;
import com.microtech.microtechsmartmgmt.repository.ProductRepository;
import com.microtech.microtechsmartmgmt.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    public Product createProduct(Product product) {
        product.setDeleted(false);
        product.setActive(true);
        return productRepository.save(product);
    }

    @Override
    public Product updateProduct(Long id, Product product) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        existing.setName(product.getName());
        existing.setDescription(product.getDescription());
        existing.setPrice(product.getPrice());
        existing.setCategory(product.getCategory());
        existing.setStockQuantity(product.getStockQuantity());
        existing.setActive(product.isActive());

        return productRepository.save(existing);
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (isProductUsedInOrders(id)) {
            product.setDeleted(true);
            product.setActive(false);
            productRepository.save(product);
        } else {
            // hard delete if not used
            productRepository.deleteById(id);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Product> getActiveProducts(Pageable pageable) {
        return productRepository.findByDeletedFalse(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isProductUsedInOrders(Long productId) {
        return orderItemRepository.existsByProductId(productId);
    }
}
