package pt.unl.fct.di.adc.firstwebapp.error;
import com.google.appengine.repackaged.org.apache.commons.codec.digest.DigestUtils;
import com.google.cloud.datastore.Entity;

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

	// With JWT, signature and expiry are verified by JwtUtils.verify().
	// This method just confirms the session entity exists (not revoked).
	public static void invalidToken(Entity entity, Token tokenJson) throws ErrorException {
		if (entity == null)
			ErrorException.trow(9903);
	}

	public static void invalidToken(Token token) throws ErrorException {
		if(token == null ||
				token.getJwt() == null ||
				token.getUsername() == null ||
				token.getRole() == null ||
				token.getIssuedAt() <=0 ||
				token.getExpiresAt() <=0) 
			ErrorException.trow(9903);
	}
}
