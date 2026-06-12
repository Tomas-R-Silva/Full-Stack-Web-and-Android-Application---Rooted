package pt.unl.fct.di.adc.firstwebapp.Utilities;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;

import pt.unl.fct.di.adc.firstwebapp.model.User.Role;

import java.util.Date;
import java.util.UUID;

public class JwtUtils {

    public static final long EXPIRATION_SECONDS = 15 * 60L; // 15 minutes

    private static final Algorithm ALGORITHM;

    static {
        String secret = System.getenv("JWT_SECRET");
        if (secret == null || secret.isBlank())
            secret = "adc-dev-secret-change-in-production";
        ALGORITHM = Algorithm.HMAC256(secret);
    }

    private JwtUtils() {}

    public static String generate(String username, Role role) {
        String jti = UUID.randomUUID().toString();
        long nowMs = System.currentTimeMillis();
        return JWT.create()
                .withJWTId(jti)
                .withSubject(username)
                .withClaim("role", role.name())
                .withIssuedAt(new Date(nowMs))
                .withExpiresAt(new Date(nowMs + EXPIRATION_SECONDS * 1000L))
                .sign(ALGORITHM);
    }

    /** Verify signature and expiry, return decoded claims. */
    public static DecodedJWT verify(String token) throws JWTVerificationException {
        JWTVerifier verifier = JWT.require(ALGORITHM).build();
        return verifier.verify(token);
    }

    /** Decode without verifying signature — use only to extract jti for cleanup. */
    public static DecodedJWT decodeUnsafe(String token) {
        return JWT.decode(token);
    }
}
