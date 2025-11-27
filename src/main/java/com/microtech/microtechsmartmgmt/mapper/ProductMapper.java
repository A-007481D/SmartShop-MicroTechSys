package com.microtech.microtechsmartmgmt.mapper;

import com.microtech.microtechsmartmgmt.dto.response.ProductResponse;
import com.microtech.microtechsmartmgmt.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ProductMapper {
    ProductResponse toResponse(Product product);
}

