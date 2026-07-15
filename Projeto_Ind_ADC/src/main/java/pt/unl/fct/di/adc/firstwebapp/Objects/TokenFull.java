package pt.unl.fct.di.adc.firstwebapp.Objects;

import java.util.Map;

import com.google.cloud.datastore.Entity;

import pt.unl.fct.di.adc.firstwebapp.Objects.User.Role;

public class TokenFull extends ShortUser implements Full{
	private static final long TIME_DIVIDER = 1000L;
	public static final long EXPIRATION_TIME = 15 * 60;

	private String jwt; // jwt is the full token, i kept the userName,role... so its easier to debug
	private Role role;
	private long issuedAt;
	private long expiresAt;

	public TokenFull() {
		this(null, null, null);
	}

	public TokenFull(String jwt, String username, Role role,long issuedAt,long expiresAt) {
		this.jwt = jwt;
		this.username = username;
		this.role = role;
		this.issuedAt = issuedAt;
		this.expiresAt = expiresAt;
	}

	public static TokenFull getfromcloud(Entity entity) {
		return new TokenFull((entity.contains("jwt"))?entity.getString("jwt"):null,
				(entity.contains("user_name"))?entity.getString("user_name"):null,
				(entity.contains("role"))?Role.valueof(entity.getString("role")):null,
				(entity.contains("issued_at"))?entity.getLong("issued_at"):0,
				(entity.contains("expires_at"))?entity.getLong("expires_at"):0);
	}

	public TokenFull(String jwt, String username, Role role) {
		this(jwt, username, role,
				System.currentTimeMillis() / TIME_DIVIDER,
				System.currentTimeMillis() / TIME_DIVIDER + EXPIRATION_TIME);
	}

	public boolean isexpierd() {
		return (expiresAt*TIME_DIVIDER)<System.currentTimeMillis();
	}

	public String getJwt() { return jwt; }
	public void setJwt(String jwt) { this.jwt = jwt; }

	public Role getRole() { return role; }
	public void setRole(Role role) { this.role = role; }
	public void setRole(String role) { this.role =Role.valueof(role); }
	public String getRoleString() {return role.name(); }

	public long getIssuedAt() { return issuedAt; }
	public void setIssuedAt(long issuedAt) { this.issuedAt = issuedAt; }

	public long getExpiresAt() { return expiresAt; }
	public void setExpiresAt(long expiresAt) { this.expiresAt = expiresAt; }

	public Map<String,Object> tomap(){
		return Map.of(
				"jwt", jwt,
				"username", username,
				"role", role.toString(),
				"issuedAt", issuedAt*TIME_DIVIDER,
				"expiresAt", expiresAt*TIME_DIVIDER
				);
	}



}
