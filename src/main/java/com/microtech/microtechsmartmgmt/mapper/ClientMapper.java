package com.microtech.microtechsmartmgmt.mapper;

import com.microtech.microtechsmartmgmt.dto.response.ClientResponse;
import com.microtech.microtechsmartmgmt.entity.Client;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;


@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ClientMapper {
    ClientResponse toResponse(Client client);
}

