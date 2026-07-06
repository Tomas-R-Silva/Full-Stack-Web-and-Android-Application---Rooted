package pt.unl.fct.di.adc.firstwebapp.Utilities;

import com.auth0.jwt.exceptions.TokenExpiredException;
import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.Key;

import pt.unl.fct.di.adc.firstwebapp.Objects.ModelToken;
import pt.unl.fct.di.adc.firstwebapp.Objects.ShortUser;
import pt.unl.fct.di.adc.firstwebapp.Objects.Token;
import pt.unl.fct.di.adc.firstwebapp.error.ErrorException;
import pt.unl.fct.di.adc.firstwebapp.error.Validator;
import pt.unl.fct.di.adc.firstwebapp.model.TokenRequestInterface;

public class AuthHelper {

	private static final Datastore datastore = DatastoreOptions.newBuilder()
			.setProjectId("adc-final")
			.build()
			.getService();

	private AuthHelper() {}

	public static Token verifyToken(TokenRequestInterface token) throws ErrorException {
		return verifyToken(token.getToken());
	}

	public static Token verifyToken(ModelToken token) throws ErrorException {
		if (token == null)
			ErrorException.trow(9903);
		return verifyToken(token.getJwt());
	}

	public static Token verifyToken(String jwt) throws ErrorException {
		if (jwt == null)
			ErrorException.trow(9903);
		Key key = datastore.newKeyFactory().setKind("Session").newKey(jwt);
		if(datastore.get(key)==null)
			ErrorException.trow(9904);
		try {
			return JWTToken.filltoken(jwt);
		} catch (TokenExpiredException e) {
			datastore.delete(key);
			ErrorException.trow(9904);
		} catch (Exception e) {
			ErrorException.trow(9903);
		}
		return null;
	}

	public static Entity getUser(ShortUser user) throws ErrorException{
		return getUser(user.getUsername());
	}

	public static Entity getUser(String username) throws ErrorException{
		Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
		Entity user = datastore.get(userKey);
		Validator.userNotFound(new Entity[]{user});
		return user;
	}
}
