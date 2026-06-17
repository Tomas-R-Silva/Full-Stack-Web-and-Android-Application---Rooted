package pt.unl.fct.di.adc.firstwebapp.resources;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import org.apache.commons.codec.digest.DigestUtils;

import com.auth0.jwt.exceptions.TokenExpiredException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.google.cloud.Timestamp;
import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.Key;
import com.google.cloud.datastore.Query;
import com.google.cloud.datastore.QueryResults;
import com.google.cloud.datastore.StructuredQuery;
import com.google.cloud.datastore.Transaction;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;   // <-- THIS ONE
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import pt.unl.fct.di.adc.firstwebapp.Utilities.AuthHelper;
import pt.unl.fct.di.adc.firstwebapp.Utilities.JWTToken;
import pt.unl.fct.di.adc.firstwebapp.Utilities.ResponceBuilder;
import pt.unl.fct.di.adc.firstwebapp.error.Error;
import pt.unl.fct.di.adc.firstwebapp.error.ErrorException;
import pt.unl.fct.di.adc.firstwebapp.error.Validator;
import pt.unl.fct.di.adc.firstwebapp.model.ChangeUserPasswordRequest;
import pt.unl.fct.di.adc.firstwebapp.model.ChangeUserPasswordRequest.PasswordInput;
import pt.unl.fct.di.adc.firstwebapp.model.ChangeUserRole;
import pt.unl.fct.di.adc.firstwebapp.model.ChangeUserRole.ChangeUserRoleInput;
import pt.unl.fct.di.adc.firstwebapp.model.CreateAccountRequest;
import pt.unl.fct.di.adc.firstwebapp.model.DeleteAccountRequest;
import pt.unl.fct.di.adc.firstwebapp.model.LogOutRequest;
import pt.unl.fct.di.adc.firstwebapp.model.LoginRequest;
import pt.unl.fct.di.adc.firstwebapp.model.LoginRequest.LoginRequestInput;
import pt.unl.fct.di.adc.firstwebapp.model.ModAccountRequest;
import pt.unl.fct.di.adc.firstwebapp.model.ModAccountRequest.Attributes;
import pt.unl.fct.di.adc.firstwebapp.model.ModAccountRequest.ModAccountRequestInput;
import pt.unl.fct.di.adc.firstwebapp.model.ShortUser;
import pt.unl.fct.di.adc.firstwebapp.model.ShowSessionsRequest;
import pt.unl.fct.di.adc.firstwebapp.model.ShowUsersRequest;
import pt.unl.fct.di.adc.firstwebapp.model.Token;
import pt.unl.fct.di.adc.firstwebapp.model.User;
import pt.unl.fct.di.adc.firstwebapp.model.User.Role;

@Path("/")
public class UserResources {

	private static final Datastore datastore = DatastoreOptions.newBuilder()
			.setProjectId("adc-final")
			.build()
			.getService();

	private static Logger Log = Logger.getLogger(UserResources.class.getName());

	public UserResources() {}

	@POST
	@Path("/createaccount")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response createAccount(CreateAccountRequest request) {
		Transaction txn = datastore.newTransaction();
		try {
			User user = request.getInput();
			Log.info("Attempt to register user: " + user.getUsername());
			if (!user.userValidation())
				return Error.invalid_input();		

			Key userKey = datastore.newKeyFactory().setKind("User").newKey(user.getUsername());
			Entity existingUser = txn.get(userKey);

			if (existingUser != null) ErrorException.trow(9901);

			Entity newUser = Entity.newBuilder(userKey)
					.set("user_name", user.getUsername())
					.set("user_pwd", DigestUtils.sha512Hex(user.getPassword()))
					.set("user_phone", user.getPhone())
					.set("user_address", user.getAddress())
					.set("user_role", user.getRole().name())
					.set("user_creation_time", Timestamp.now())
					.build();

			txn.put(newUser);
			txn.commit();

			Log.info("User registered: " + user.getUsername());
			return buildresponse(Map.of(
					"username", user.getUsername(),
					"role", user.getRole().name()));

		} catch (Exception e) {
			txn.rollback();
			Log.severe("Error registering user: " + e.getMessage());
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/login")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response userLogin(LoginRequest request) {
		try {
			LoginRequestInput userToLog = request.getInput();

			Log.info("Attempt to create userLogin: " + userToLog.getUsername());

			Entity user = getUser(userToLog);

			Validator.invalidCredencials(userToLog.getPassword(), user.getString("user_pwd"));

			String userName = user.getKey().getName();
			Role role = Role.valueof(user.getString("user_role"));

			String jwtString = JWTToken.createJWT(userName, Map.of("role", role.name()));
			DecodedJWT decoded = JWTToken.decodeUnsafe(jwtString);
			String jti = decoded.getId();
			long issuedAt = decoded.getIssuedAt().getTime() / 1000L;
			long expiresAt = decoded.getExpiresAt().getTime() / 1000L;

			Key sessionKey = datastore.newKeyFactory().setKind("Session").newKey(jti);
			Entity sessionEntity = Entity.newBuilder(sessionKey)
					.set("jti", jti)
					.set("user_name", userName)
					.set("role", role.name())
					.set("issued_at", issuedAt)
					.set("expires_at", expiresAt)
					.build();

			datastore.put(sessionEntity);
			return buildresponse(Map.of("token", Map.of(
					"jwt", jwtString,
					"username", userName,
					"role", role.toString(),
					"issuedAt", issuedAt,
					"expiresAt", expiresAt
					)));
		}catch(Exception e) {
			return Error.fromexception(e);
		}

	}

	@POST
	@Path("/showusers")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response showUsers(ShowUsersRequest request) {
		try {
			Token tokenJson = request.getToken();
			AuthHelper.verifyToken(tokenJson);

			Validator.unauthorized(tokenJson, new Role[] {Role.ADMIN, Role.BOFFICER});

			Query<Entity> query = Query.newEntityQueryBuilder().setKind("User").build();

			QueryResults<Entity> results = datastore.run(query);

			List<Map<String, String>> users = new ArrayList<>();

			while (results.hasNext()) {
				Entity e = results.next();
				users.add(Map.of(
						"username", e.getString("user_name"),
						"role", e.getString("user_role")
						));
			}
			return buildresponse(Map.of("users", users));
		}catch(Exception e) {
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/deleteaccount")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response deleteAccount(DeleteAccountRequest request){
		try {
			ShortUser userJson = request.getInput();
			Token tokenJson = request.getToken();
			Key userKeyToBeDeleted = getUser(userJson).getKey();	
			AuthHelper.verifyToken(tokenJson);

			Validator.unauthorized(tokenJson, new Role []{Role.ADMIN});

			datastore.delete(userKeyToBeDeleted);
			deleteAllSessionsForUser(userJson.getUsername());
			return buildresponse(Map.of("message", "Account deleted successfully"));
		}catch(Exception e) {
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/modaccount")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response modifyAccount(ModAccountRequest request) {
		try {
			ModAccountRequestInput input = request.getInput();
			Attributes attributes = request.getInput().getAttributes();
			String username = input.getUsername();
			Token tokenJson = request.getToken();

			Entity user = getUser(username);
			Token token = AuthHelper.verifyToken(tokenJson);

			if (!token.getUsername().equals(username)) 
				Validator.unauthorized(tokenJson, new Role[]{Role.BOFFICER,Role.ADMIN});

			Entity updatedUser = Entity.newBuilder(user)
					.set("user_address", attributes.getAddress())
					.set("user_phone", attributes.getPhone())
					.build();

			datastore.put(updatedUser);
			return buildresponse(Map.of("message", "Updated successfully"));
		}catch(Exception e) {
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/showuserrole")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response showUserRole (ShowUsersRequest request){
		try{
			ShortUser userJson = request.getInput();
			Token tokenJson = request.getToken();
			
			Entity user = getUser(userJson.getUsername());
			AuthHelper.verifyToken(tokenJson);
			
			Validator.unauthorized(tokenJson, new Role [] {Role.ADMIN, Role.BOFFICER});
			return buildresponse(Map.of(
					"username", user.getString("user_name"),
					"role", user.getString("user_role")
					));
		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/logout")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response logOut(LogOutRequest request){
		try{
			ShortUser userJson = request.getInput();
			Token tokenJson = request.getToken();

			Entity user = getUser(userJson.getUsername());
			Token token = AuthHelper.verifyToken(tokenJson);

			if(!token.getUsername().equals(user.getString("user_name")))
				Validator.unauthorized(tokenJson, new Role [] {Role.ADMIN});

			deleteAllSessionsForUser(userJson.getUsername());
			return buildresponse(Map.of("message", "Logout successful"));
		} catch (Exception e) {
			return Error.fromexception(e);
		}	
	}

	@POST
	@Path("/changeuserrole")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response changeUserRole(ChangeUserRole request) {
		try{
			ChangeUserRoleInput input = request.getInput();
			Token tokenJson = request.getToken();

			Entity user = getUser(input.getUsername());
			AuthHelper.verifyToken(tokenJson);

			Validator.unauthorized(tokenJson, new Role[] {Role.ADMIN});
			Role newRole = Role.valueof(input.getNewrole());
			Entity updatedUser = Entity.newBuilder(user)
					.set("user_role", newRole.name())
					.build();

			datastore.put(updatedUser);
			// JWT role is embedded in the token — invalidate all sessions so user re-logs with new role
			deleteAllSessionsForUser(input.getUsername());
			return buildresponse(Map.of("message", "Role updated successfully"));
		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/changeuserpwd")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response changeUserPassword(ChangeUserPasswordRequest request) {
		try{
			PasswordInput input = request.getInput();
			Token tokenJson = request.getToken();

			Entity user = getUser(input.getUsername());
			Token token = AuthHelper.verifyToken(tokenJson);

			if(!token.getUsername().equals(user.getString("user_name")))
				Validator.unauthorized(tokenJson, new Role[] {Role.ADMIN});

			String oldPwdHash = DigestUtils.sha512Hex(input.getOldpassword());
			if (!oldPwdHash.equals(user.getString("user_pwd"))) 
				ErrorException.trow(9907);

			Entity updatedUser = Entity.newBuilder(user)
					.set("user_pwd", DigestUtils.sha512Hex(input.getNewpassword()))
					.build();
			datastore.put(updatedUser);
			return buildresponse(Map.of("message", "Password changed successfully"));

		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/showauthsessions")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response showAuthsessions (ShowSessionsRequest request){
		try{
			Token tokenJson = request.getToken();
			AuthHelper.verifyToken(tokenJson);
			Validator.unauthorized(tokenJson, new Role[] {Role.ADMIN});
			return buildresponse(Map.of("tokens", getAllSessions()));

		} catch (Exception e){
			return Error.fromexception(e);
		}
	}	

	private List<Map<String, Object>> getAllSessions (){
		Query<Entity> query = Query.newEntityQueryBuilder()
				.setKind("Session")
				.build();

		QueryResults<Entity> sessions = datastore.run(query);
		List<Map<String, Object>> tokensOutput = new ArrayList<>();

		while(sessions.hasNext()){
			Entity session = sessions.next();
			tokensOutput.add(Map.of(
					"tokenID", session.getString("jti"),
					"username", session.getString("user_name"),
					"role", session.getString("role"),
					"expiresAt", session.getLong("expires_at")
					));
		}

		return tokensOutput;

	}

	private void deleteAllSessionsForUser(String username) {
		Query<Entity> query = Query.newEntityQueryBuilder()
				.setKind("Session")
				.setFilter(StructuredQuery.PropertyFilter.eq("user_name", username))
				.build();

		QueryResults<Entity> sessions = datastore.run(query);

		while (sessions.hasNext()) {
			Entity session = sessions.next();
			datastore.delete(session.getKey());
		}
	}

	private void updateUserTokensRole(String username, String newRole) {
		Query<Entity> query = Query.newEntityQueryBuilder()
				.setKind("Session")
				.setFilter(StructuredQuery.PropertyFilter.eq("user_name", username))
				.build();

		QueryResults<Entity> sessions = datastore.run(query);

		//List<Entity> updatedSessions = new ArrayList<>();

		while (sessions.hasNext()) {
			Entity session = sessions.next();
			Entity updated = Entity.newBuilder(session)
					.set("role", newRole) // atualiza o role
					.build();
			datastore.put(updated);
		}
	}

	private static Response buildresponse(Map<String,Object> map) {
		return ResponceBuilder.constructor("success",map);
	}

	private Entity getUser(ShortUser user) throws ErrorException{
		return getUser(user.getUsername());
	}

	private Entity getUser(String username) throws ErrorException {
		Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
		Entity user = datastore.get(userKey);
		Validator.userNotFound(new Entity[]{user});
		return user;
	}




}