package pt.unl.fct.di.adc.firstwebapp.Utilities;

import com.auth0.jwt.exceptions.TokenExpiredException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.google.cloud.datastore.Key;

import pt.unl.fct.di.adc.firstwebapp.Objects.Token;
import pt.unl.fct.di.adc.firstwebapp.Objects.User.Role;
import pt.unl.fct.di.adc.firstwebapp.error.ErrorException;

public class AuthHelper {

    private static final Datastore datastore = DatastoreOptions.newBuilder()
            .setProjectId("adc-final")
            .build()
            .getService();

    private AuthHelper() {}

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
}
