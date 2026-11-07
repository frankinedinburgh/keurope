package com.keurope.admin;

import com.keurope.auth.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/** Requires a JWT with is_admin=true. */
@Component
public class AdminInterceptor implements HandlerInterceptor {

    private final JwtService jwtService;

    public AdminInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws IOException {
        String header = request.getHeader("Authorization");
        if (header == null || header.isEmpty()) {
            return reject(response, "Missing authorization header");
        }

        if (!header.startsWith("Bearer ")) {
            return reject(response, "Invalid authorization header format");
        }

        if (!jwtService.isValidAdminToken(header.substring("Bearer ".length()))) {
            return reject(response, "Invalid or expired token");
        }

        return true;
    }

    private boolean reject(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        // Messages are fixed strings above, so no JSON escaping needed
        response.getWriter().write("{\"error\":\"" + message + "\"}\n");
        return false;
    }
}
