package com.keurope.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("keurope")
public record KeuropeProperties(String jwtSecret, String adminPassword) {
}
