package pt.unl.fct.di.adc.firstwebapp.Objects;

import java.util.Map;

import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.Key;

import pt.unl.fct.di.adc.firstwebapp.Objects.User.Role;

public class TokenFull extends ShortUser implements Full{
	private static final long TIME_DIVIDER = 1000L;
	public static final long EXPIRATION_TIME = 15 * 60;

	private String jwt; // jwt is the full token, i kept the userName,role... so its easier to debug
	private Role role;
	private long issuedAt;
	private long expiresAt;
	private final Key key;

	private TokenFull(Key key) {this.key=key;}
	
	public TokenFull(Key key,String jwt, String username, Role role,long issuedAt,long expiresAt) {
		this(key);
		this.jwt = jwt;
		this.username = username;
		this.role = role;
		this.issuedAt = issuedAt;
		this.expiresAt = expiresAt;
	}

	public TokenFull(Key key,String jwt, String username, Role role) {
		this(key,jwt, username, role,
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

	@Override
	public Map<String,Object> tomap(){
		return Map.of(
				"jwt", jwt,
				"username", username,
				"role", role.toString(),
				"issuedAt", issuedAt*TIME_DIVIDER,
				"expiresAt", expiresAt*TIME_DIVIDER
				);
	}

	@Override
	public Entity toentity() {
		return Entity.newBuilder(key)
				.set("jwt", jwt)
				.set("user_name", username)
				.set("role", role.name())
				.set("issued_at", issuedAt/TIME_DIVIDER)
				.set("expires_at", expiresAt/TIME_DIVIDER)
				.build();
	}

	public static TokenFull fromdatabase(Entity entity) {
		if(entity==null)return null;
		return new TokenFull(entity.getKey(),
				Full.getString(entity,"jwt"),
				Full.getString(entity,"user_name"),
				Role.valueof(Full.getString(entity,"role")),
				Full.getLong(entity, "issued_at"),
				Full.getLong(entity, "expires_at"));
	}

	@Override
	public Key getKey() {return key;}
	@Override
	public Map<String, Object> tomap(Entity e) {return fromdatabase(e).tomap();}
}
