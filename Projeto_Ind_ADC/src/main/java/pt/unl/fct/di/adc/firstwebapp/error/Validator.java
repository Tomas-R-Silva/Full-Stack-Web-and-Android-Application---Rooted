package pt.unl.fct.di.adc.firstwebapp.error;
import com.google.cloud.datastore.Entity;
import com.google.appengine.repackaged.org.apache.commons.codec.digest.DigestUtils;

import jakarta.ws.rs.core.Response;
import pt.unl.fct.di.adc.firstwebapp.model.Token;
import pt.unl.fct.di.adc.firstwebapp.model.User;
import pt.unl.fct.di.adc.firstwebapp.model.User.Role;

public class Validator {

    private static final Error error = new Error();

    public static Response userNotFound(Entity []users) {
        for(Entity user : users){
            if( user == null) return error.user_not_found();
        }
        return null;
    }


    public static Response unauthorized(Role role, Role []allowed) {
        for (Role r : allowed) {
            if (r == role) return null;
        }
        return error.unauthorized();
    }

    public static Response invalidCredencials(String password, String pwd){
        String hashedPassword = DigestUtils.sha512Hex(password);
        if(!pwd.equals(hashedPassword)){
            return error.invalid_credencials();
        } 
        return null;
    }

    public static Response userAlreadyExists(User user){
        if(user != null){
            return error.user_already_exists();
        }
        return null;
    }

    public static Response invalidInput(){
        return error.invalid_input();
    }

    public static Response forbidden(){
        return error.forbidden();
    }

    public static Response invalidToken(Entity entity , String userName) {
        if (entity == null ||
            !entity.contains("token_id") ||
            !entity.contains("user_name") ||
            !entity.contains("role") ||
            !entity.contains("issued_at") ||
            !entity.contains("expires_at")||
            !entity.getString("user_name").equals(userName)) {

            return error.invalid_token();
        }
        return null;
    }

    public static Response tokenExpired(Entity entity) {
        long expiresAt = entity.getLong("expires_at");
        if ((System.currentTimeMillis() / 1000) > expiresAt) {
            return error.token_expired();
        }
        return null;
    }

    public static Response invalidToken(Token token) {
        if (token == null ||
            token.getTokenId() == null ||
            token.getUsername() == null ||
            token.getRole() == null ||
            token.getIssuedAt() <=0 ||
            token.getExpiresAt() <=0) {

            return error.invalid_token();
        }
        return null;
    }

    public static Response tokenExpired(Token token) {
        long now = System.currentTimeMillis() / 1000;

        if (now > token.getExpiresAt()) {
            return error.token_expired();
        }
        return null;
    }
}
