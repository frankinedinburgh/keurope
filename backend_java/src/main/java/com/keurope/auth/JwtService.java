package com.keurope.auth;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.keurope.common.Strings;
import com.keurope.config.KeuropeProperties;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import org.springframework.stereotype.Service;

/** HS256 tokens with the same claims as the Go backend, so tokens are interchangeable. */
@Service
public class JwtService {

    private static final Duration TOKEN_TTL = Duration.ofHours(24);

    private final Algorithm algorithm;
    private final JWTVerifier verifier;

    public JwtService(KeuropeProperties properties) {
        this.algorithm = Algorithm.HMAC256(properties.jwtSecret());
        this.verifier = JWT.require(algorithm).build();
    }

    public String generateUserToken(User user) {
        return JWT.create()
                .withClaim("user_id", user.id())
                .withClaim("email", user.email())
                .withExpiresAt(Instant.now().plus(TOKEN_TTL))
                .sign(algorithm);
    }

    public Optional<UserClaims> verifyUserToken(String token) {
        return decode(token).map(jwt -> new UserClaims(
                Strings.orEmpty(jwt.getClaim("user_id").asString()),
                Strings.orEmpty(jwt.getClaim("email").asString())));
    }

    public String generateAdminToken() {
        Instant now = Instant.now();
        return JWT.create()
                .withExpiresAt(now.plus(TOKEN_TTL))
                .withIssuedAt(now)
                .withClaim("is_admin", true)
                .sign(algorithm);
    }

    public boolean isValidAdminToken(String token) {
        return decode(token)
                .map(jwt -> Boolean.TRUE.equals(jwt.getClaim("is_admin").asBoolean()))
                .orElse(false);
    }

    private Optional<DecodedJWT> decode(String token) {
        try {
            return Optional.of(verifier.verify(token));
        } catch (JWTVerificationException e) {
            return Optional.empty();
        }
    }
}
