package pt.unl.fct.di.adc.firstwebapp.Utilities;

import com.auth0.jwt.exceptions.TokenExpiredException;
import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.Key;
import com.google.cloud.datastore.Query;
import com.google.cloud.datastore.QueryResults;
import com.google.cloud.datastore.StructuredQuery.PropertyFilter;

import pt.unl.fct.di.adc.firstwebapp.Objects.ModelToken;
import pt.unl.fct.di.adc.firstwebapp.Objects.ShortUser;
import pt.unl.fct.di.adc.firstwebapp.Objects.TokenFull;
import pt.unl.fct.di.adc.firstwebapp.Objects.UserFull;
import pt.unl.fct.di.adc.firstwebapp.error.ErrorException;
import pt.unl.fct.di.adc.firstwebapp.error.Validator;
import pt.unl.fct.di.adc.firstwebapp.model.TokenRequestInterface;

public class AuthHelper {
	private static final int DELETE_BATCH = 500;
	private static final Datastore datastore = DatastoreOptions.newBuilder()
			.setProjectId("adc-final")
			.build()
			.getService();

	private AuthHelper() {}

	public static TokenFull verifyToken(TokenRequestInterface token) throws ErrorException {
		return verifyToken(token.getToken());
	}

	public static TokenFull verifyToken(ModelToken token) throws ErrorException {
		if (token == null)
			ErrorException.trow(9903);
		return verifyToken(token.getJwt());
	}

	public static TokenFull verifyToken(String jwt) throws ErrorException {
		if (jwt == null)
			ErrorException.trow(9903);
		Key key = datastore.newKeyFactory().setKind("Session").newKey(jwt);
		if(datastore.get(key)==null)
			ErrorException.trow(9904);
		try {
			return JWTToken.filltoken(datastore,jwt);
		} catch (TokenExpiredException e) {
			datastore.delete(key);
			ErrorException.trow(9904);
		} catch (Exception e) {
			ErrorException.trow(9903);
		}
		return null;
	}

	public static UserFull getUser(ShortUser user) throws ErrorException{
		return getUser(user.getUsername());
	}

	public static UserFull getUser(String username) throws ErrorException{
		Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
		Entity user = datastore.get(userKey);
		Validator.userNotFound(new Entity[]{user});
		return UserFull.fromdatabase(user);
	}
	
	public static int querydelete(String kind,String type,String name) {
		QueryResults<Key> keys = datastore.run(Query.newKeyQueryBuilder()
				.setKind(kind)
				.setFilter(PropertyFilter.eq(type, name))
				.build());
		int deleted = 0;
		int times = 0;
		Key[] keylist=new Key[DELETE_BATCH];
		while (keys.hasNext()) {
			keylist[deleted++]=keys.next();
			if (deleted == DELETE_BATCH) {
				datastore.delete(keylist);
				keylist=new Key[DELETE_BATCH];
				times++;
				deleted=0;
			}
		}
		if (deleted>0)
			datastore.delete(keylist);
		return times * DELETE_BATCH + deleted;
	}
}
