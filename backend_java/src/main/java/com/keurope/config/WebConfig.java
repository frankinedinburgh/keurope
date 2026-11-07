package com.keurope.config;

import com.keurope.admin.AdminInterceptor;
import com.keurope.auth.AuthInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;
    private final AdminInterceptor adminInterceptor;

    public WebConfig(AuthInterceptor authInterceptor, AdminInterceptor adminInterceptor) {
        this.authInterceptor = authInterceptor;
        this.adminInterceptor = adminInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // User protected routes
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/cart", "/api/cart/**", "/api/orders");

        // Admin protected routes (login itself is public)
        registry.addInterceptor(adminInterceptor)
                .addPathPatterns("/api/admin/**")
                .excludePathPatterns("/api/admin/login");
    }
}
