package pt.unl.fct.di.adc.firstwebapp.Objects;

import pt.unl.fct.di.adc.firstwebapp.Objects.User.Role;

public class Token extends ShortUser {

    public static final long EXPIRATION_TIME = 15 * 60;

    private String jwt; // jwt is the full token, i kept the userName,role... so its easier to debug
    private Role role;
    private long issuedAt;
    private long expiresAt;

    public Token() {
        this(null, null, null);
    }

    public Token(String jwt, String username, Role role) {
        this.jwt = jwt;
        this.username = username;
        this.role = role;
        long now = System.currentTimeMillis() / 1000;
        this.issuedAt = now;
        this.expiresAt = now + EXPIRATION_TIME;
    }

    public String getJwt() { return jwt; }
    public void setJwt(String jwt) { this.jwt = jwt; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public void setRole(String role) { this.role =Role.valueof(role); }
    
    
    public long getIssuedAt() { return issuedAt; }
    public void setIssuedAt(long issuedAt) { this.issuedAt = issuedAt; }

    public long getExpiresAt() { return expiresAt; }
    public void setExpiresAt(long expiresAt) { this.expiresAt = expiresAt; }
}
