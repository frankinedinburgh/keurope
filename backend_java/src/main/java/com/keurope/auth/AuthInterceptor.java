package com.keurope.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/** Requires a valid user JWT and stores its claims on the request for controllers. */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    public static final String CLAIMS_ATTRIBUTE = "claims";

    private final JwtService jwtService;

    public AuthInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws IOException {
        String token = BearerToken.extract(request);
        Optional<UserClaims> claims = token.isEmpty() ? Optional.empty() : jwtService.verifyUserToken(token);

        if (claims.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("text/plain; charset=utf-8");
            response.getWriter().write("Unauthorized\n");
            return false;
        }

        request.setAttribute(CLAIMS_ATTRIBUTE, claims.get());
        return true;
    }
}
