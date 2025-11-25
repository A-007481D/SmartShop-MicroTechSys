package com.microtech.microtechsmartmgmt.entity;

import com.microtech.microtechsmartmgmt.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.repository.cdi.Eager;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Getter
@Setter
@Table(name = "users")
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public class User extends  BaseEntity {

    @Column(nullable = false)
    private String name;
    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;
}
