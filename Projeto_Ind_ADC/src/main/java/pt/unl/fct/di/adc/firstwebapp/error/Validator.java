package pt.unl.fct.di.adc.firstwebapp.error;
import com.google.appengine.repackaged.org.apache.commons.codec.digest.DigestUtils;
import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.Key;

import pt.unl.fct.di.adc.firstwebapp.model.Token;
import pt.unl.fct.di.adc.firstwebapp.model.User.Role;

public class Validator {
	public static void userNotFound(Entity[] users) throws ErrorException {
		for(Entity user : users)
			if(user == null) 
				ErrorException.trow(9902);
	}


	public static void unauthorized(Role role, Role[] allowed) throws ErrorException {
		for (Role r : allowed)
			if (r == role) 
				return ;
		ErrorException.trow(9905);
	}

	public static void unauthorized(Token tokenJson, Role[] allowed) throws ErrorException {
		unauthorized(tokenJson.getRole(),allowed);
	}

	public static void invalidCredencials(String password, String pwd) throws ErrorException {
		String hashedPassword = DigestUtils.sha512Hex(password);
		if(!pwd.equals(hashedPassword))
			ErrorException.trow(9900);
	}

	public static void invalidInput() throws ErrorException {
		ErrorException.trow(9906);
	}

	public static void forbidden() throws ErrorException {
		ErrorException.trow(9907);
	}

	public static void invalidToken(Entity entity , Token tokenJson) throws ErrorException {
		if(entity == null ||
				!entity.contains("token_id")||
				!entity.contains("user_name")||
				!entity.contains("role")||
				!entity.contains("issued_at")||
				!entity.contains("expires_at")||
				!entity.getString("token_id").equals(tokenJson.getTokenId()) ||
				!entity.getString("user_name").equals(tokenJson.getUsername()) ||
				!entity.getString("role").equals(tokenJson.getUsername()) ||
				entity.getLong("issued_at")!=tokenJson.getIssuedAt() ||
				entity.getLong("expires_at")!=tokenJson.getExpiresAt())
			ErrorException.trow(9903);
	}

	public static void tokenExpired(Entity entity,Key key) throws ErrorException {
		long expiresAt = entity.getLong("expires_at");
		if((System.currentTimeMillis() / 1000) > expiresAt) 
			ErrorException.trow(9904,key);
	}

	public static void invalidToken(Token token) throws ErrorException {
		if(token == null ||
				token.getTokenId() == null ||
				token.getUsername() == null ||
				token.getRole() == null ||
				token.getIssuedAt() <=0 ||
				token.getExpiresAt() <=0) 
			ErrorException.trow(9903);
	}
}
