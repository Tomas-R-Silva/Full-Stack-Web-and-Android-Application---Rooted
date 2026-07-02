package pt.unl.fct.di.adc.firstwebapp.Utilities;

import com.auth0.jwt.exceptions.TokenExpiredException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.Key;

import pt.unl.fct.di.adc.firstwebapp.Objects.ShortUser;
import pt.unl.fct.di.adc.firstwebapp.Objects.Token;
import pt.unl.fct.di.adc.firstwebapp.Objects.User.Role;
import pt.unl.fct.di.adc.firstwebapp.error.ErrorException;
import pt.unl.fct.di.adc.firstwebapp.error.Validator;
import pt.unl.fct.di.adc.firstwebapp.model.ModelInterface;
import pt.unl.fct.di.adc.firstwebapp.model.TokenRequestInterface;

public class AuthHelper {

	private static final Datastore datastore = DatastoreOptions.newBuilder()
			.setProjectId("adc-final")
			.build()
			.getService();

	private static final ObjectMapper mapper = new ObjectMapper()
			.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

	private AuthHelper() {}

	public static <E extends ModelInterface> E verifyInput(Object obj,Class<E> clas) throws ErrorException {
		try {
			// The endpoints receive the body as Object, so Jackson gives us a
			// LinkedHashMap. A raw (E) cast can't turn that Map into the request
			// POJO (it throws ClassCastException); convertValue actually maps it.
			return mapper.convertValue(obj, clas);
		}catch (Exception e) {
			try {
				ErrorException.trow(9929,ModelInterface.formate(clas));
			}catch (Exception e1) {
				if(e1 instanceof ErrorException)
					throw (ErrorException)e1;
				else
					ErrorException.trow(9929,e1.toString());
				}
		}
		return null;
	}

	public static Token verifyToken(TokenRequestInterface token) throws ErrorException {
		return verifyToken(token.getToken());
	}

	public static Token verifyToken(String jwt) throws ErrorException {
		Token token = new Token();
		token.setJwt(jwt);
		return verifyToken(token);
	}

	public static Token verifyToken(Token tokenJson) throws ErrorException {
		if (tokenJson == null || tokenJson.getJwt() == null)
			ErrorException.trow(9903);
		try {
			DecodedJWT decoded = JWTToken.verifyJWT(tokenJson.getJwt());
			tokenJson.setUsername(decoded.getSubject());
			tokenJson.setRole(Role.valueof(decoded.getClaim("role").asString()));

			Key sessionKey = datastore.newKeyFactory().setKind("Session").newKey(decoded.getId());
			if (datastore.get(sessionKey) == null)
				ErrorException.trow(9903);

			return tokenJson;
		} catch (TokenExpiredException e) {
			try {
				String jti = JWTToken.decodeUnsafe(tokenJson.getJwt()).getId();
				datastore.delete(datastore.newKeyFactory().setKind("Session").newKey(jti));
			} catch (Exception ignored) {}
			ErrorException.trow(9904);
			return null;
		} catch (ErrorException e) {
			throw e;
		} catch (Exception e) {
			ErrorException.trow(9903);
			return null;
		}
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
