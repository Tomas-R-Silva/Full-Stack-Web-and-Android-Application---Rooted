package pt.unl.fct.di.adc.firstwebapp.Objects;

import java.util.Map;

import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.Key;

import pt.unl.fct.di.adc.firstwebapp.Objects.User.Role;

public class TokenFull extends ShortUser implements Full{
	private static final long TIME_DIVIDER = 1000L;
	public static final long EXPIRATION_TIME = 15 * 60;

	private final String jwt; // jwt is the full token, i kept the userName,role... so its easier to debug
	private final Role role;
	private final long issuedAt;
	private final long expiresAt;
	private final Key key;

	
	public TokenFull(Key key,String jwt, String username, Role role,long issuedAt,long expiresAt) {
		this.key = key;
		this.jwt = jwt;
		this.username = username;
		this.role = role;
		this.issuedAt = issuedAt;
		this.expiresAt = expiresAt;
	}

	public boolean isexpierd() {return expiresAt<System.currentTimeMillis();}
	public String getJwt() { return jwt; }
	public Role getRole() { return role; }
	public String getRoleString() {return role.name(); }
	public long getIssuedAt() { return issuedAt; }
	public long getExpiresAt() { return expiresAt; }


	@Override
	public Map<String,Object> tomap(){
		return Map.of(
				"jwt", Full.string(jwt),
				"username", Full.string(username),
				"role", Full.string(role.name()),
				"issuedAt", issuedAt*TIME_DIVIDER,
				"expiresAt", expiresAt*TIME_DIVIDER
				);
	}

	@Override
	public Entity toentity() {
		return Entity.newBuilder(key)
				.set("jwt", Full.string(jwt))
				.set("user_name", Full.string(username))
				.set("role", Full.string(role.name()))
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
