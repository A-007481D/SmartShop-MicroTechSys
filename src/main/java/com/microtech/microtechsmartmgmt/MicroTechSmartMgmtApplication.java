package com.microtech.microtechsmartmgmt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class MicroTechSmartMgmtApplication {

    public static void main(String[] args) {
        SpringApplication.run(MicroTechSmartMgmtApplication.class, args);
    }

}
