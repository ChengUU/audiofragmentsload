package com.amory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.support.SpringBootServletInitializer;

@SpringBootApplication(scanBasePackages = {"com.amory.*"})
public class MainServiceApplication extends SpringBootServletInitializer {
    public static void main(final String[] args) {
        SpringApplication.run(MainServiceApplication.class, args);
    }
}

