package com.microtech.microtechsmartmgmt.repository;

import com.microtech.microtechsmartmgmt.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByDeletedFalse();

    List<Product> findByDeletedFalseAndActiveTrue();

    Page<Product> findByDeletedFalse(Pageable pageable);
}
