package com.microtech.microtechsmartmgmt.mapper;

import com.microtech.microtechsmartmgmt.dto.response.ClientResponse;
import com.microtech.microtechsmartmgmt.entity.Client;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;


@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ClientMapper {

    @Mapping(target = "id", source = "id")
    @Mapping(target = "username", source = "username")
    @Mapping(target = "createdAt", source = "createdAt")
    ClientResponse toResponse(Client client);
}

