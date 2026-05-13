package pt.unl.fct.di.adc.firstwebapp.resources;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import pt.unl.fct.di.adc.firstwebapp.model.LoginRequest;
import pt.unl.fct.di.adc.firstwebapp.model.ModAccountRequest;
import pt.unl.fct.di.adc.firstwebapp.model.ModAccountRequest.Attributes;
import pt.unl.fct.di.adc.firstwebapp.model.ShowSessionsRequest;
import pt.unl.fct.di.adc.firstwebapp.model.ShowUsersRequest;
import pt.unl.fct.di.adc.firstwebapp.model.Token;
import pt.unl.fct.di.adc.firstwebapp.model.User;
import pt.unl.fct.di.adc.firstwebapp.model.User.Role;
import pt.unl.fct.di.adc.firstwebapp.model.ChangeUserPasswordRequest;
import pt.unl.fct.di.adc.firstwebapp.model.ChangeUserRole;
import pt.unl.fct.di.adc.firstwebapp.model.CreateAccountRequest;
import pt.unl.fct.di.adc.firstwebapp.model.DeleteAccountRequest;
import pt.unl.fct.di.adc.firstwebapp.model.LogOutRequest;
import pt.unl.fct.di.adc.firstwebapp.error.Error;
import pt.unl.fct.di.adc.firstwebapp.error.Validator;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.logging.Logger;
import org.apache.commons.codec.digest.DigestUtils;

import com.google.gson.Gson;
import com.google.cloud.Timestamp;
import com.google.cloud.datastore.Key;
import com.google.cloud.datastore.Query;
import com.google.cloud.datastore.QueryResults;
import com.google.cloud.datastore.StructuredQuery;
import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.Transaction;
import com.google.cloud.datastore.DatastoreOptions;

import jakarta.inject.Singleton;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;
import jakarta.ws.rs.Produces;   // <-- THIS ONE
import jakarta.ws.rs.core.MediaType;

@Path("/")
public class UserResources{

	private static final Datastore datastore = DatastoreOptions.newBuilder()
        .setProjectId("adc-ind")
        .build()
        .getService();

    private static Logger Log = Logger.getLogger(UserResources.class.getName());
	private static Error error = new Error();



	public UserResources() {
	}

	@POST
    @Path("/createaccount")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
	public Response createAccount(CreateAccountRequest request) {

		Transaction txn = datastore.newTransaction();

		try {
			
		User user = request.input;

		Log.info("Attempt to register user: " + user.getUsername());

		if (!user.userValidation()) {
			return error.invalid_input();		
		}

			Key userKey = datastore.newKeyFactory().setKind("User").newKey(user.getUsername());

			Entity existingUser = txn.get(userKey);

			if (existingUser != null) {
				txn.rollback();
				return error.user_already_exists();
			}

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

			return Response.ok()
					.entity(Map.of(
							"status", "success",
							"data", Map.of(
									"username", user.getUsername(),
									"role", user.getRole().name()
							)
					))
					.build();

		} catch (Exception e) {
			txn.rollback();

			Log.severe("Error registering user: " + e.getMessage());

			return Response.status(Status.OK)
					.entity(Map.of(
							"status", "9906",
							"data", "INVALID_INPUT"
					))
					.build();
		}
	}

	@POST
    @Path("/login")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
	public Response userLogin(LoginRequest request) {
		User userToLog = request.getInput();

		Log.info("Attempt to create userLogin: " + userToLog.getUsername());

		Key userKey = datastore.newKeyFactory().setKind("User").newKey(userToLog.getUsername());
		Entity user = datastore.get(userKey);

		Response err = Validator.userNotFound(new Entity [] {user});
		if(err != null){ return err;}


		err = Validator.invalidCredencials(userToLog.getPassword(), user.getString("user_pwd"));
		if(err != null){ return err;}

		String tokenID = UUID.randomUUID().toString();
		String userName = user.getKey().getName();
		Role role = Role.valueOf(user.getString("user_role"));
		Token token = new Token(tokenID, userName, role);

		Key sessionKey = datastore.newKeyFactory().setKind("Session").newKey(tokenID);

		Entity sessionEntity = Entity.newBuilder(sessionKey)
						.set("token_id", token.getTokenId())
        				.set("user_name", token.getUsername())
        				.set("role", token.getRole().toString())
						.set("issued_at", token.getIssuedAt())
        				.set("expires_at", token.getExpiresAt()) // se quiseres expiração
        				.build();

		datastore.put(sessionEntity);
			return Response.ok()
			.entity(Map.of(
				"status", "success",
				"data", Map.of(
					"token", Map.of(
						"tokenId", tokenID,
						"username", user.getString("user_name"),
						"role", role.toString(),
						"issuedAt", token.getIssuedAt(),
						"expiresAt", token.getExpiresAt()
					)
				)
			))
			.build();
	}

	@POST
	@Path("/showusers")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
	public Response showUsers(ShowUsersRequest request) {

		Token tokenJson = request.getToken();
		Key tokenKey = datastore.newKeyFactory().setKind("Session").newKey(tokenJson.getTokenId());

		Entity token = datastore.get(tokenKey);
		

		Response err = Validator.invalidToken(token, tokenJson.getUsername());
		if(err != null){ return err;}

		Role role = Role.valueOf(token.getString("role"));

		err = Validator.unauthorized(role, new Role []{Role.ADMIN, Role.BOFFICER});
		if(err != null){ return err;}
		

		err = Validator.tokenExpired(token);
		if (err != null) {
			datastore.delete(tokenKey);
			return err;
		}


		
		 Query<Entity> query = Query.newEntityQueryBuilder()
        .setKind("User")
        .build();

		QueryResults<Entity> results = datastore.run(query);

		List<Map<String, String>> users = new ArrayList<>();

		while (results.hasNext()) {
			Entity e = results.next();

			users.add(Map.of(
				"username", e.getString("user_name"),
				"role", e.getString("user_role")
			));
		}

		return Response.ok(
			Map.of(
				"status", "success",
				"data", Map.of("users", users)
			)
		).build();

	}

	@POST
	@Path("/deleteaccount")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
	public Response deleteAccount(DeleteAccountRequest request){
		User userJson = request.getInput();
		Token tokenJson = request.getToken();

		Key userKeyToBeDeleted = datastore.newKeyFactory().setKind("User").newKey(userJson.getUsername());
		Entity userToBeDeleted = datastore.get(userKeyToBeDeleted);


		Key userKey = datastore.newKeyFactory().setKind("User").newKey(tokenJson.getUsername());
		Entity user = datastore.get(userKey);
		
		Key tokenKey = datastore.newKeyFactory()
		.setKind("Session")
		.newKey(tokenJson.getTokenId());

		Entity token = datastore.get(tokenKey);
	
		Response err = Validator.userNotFound(new Entity[]{user, userToBeDeleted});
    	if (err != null) return err;

		err = Validator.invalidToken(token, tokenJson.getUsername());
		if(err != null){ return err;}

		err = Validator.tokenExpired(token);
		if(err != null){ 
			datastore.delete(tokenKey);
			return err;
		}

		Role role = Role.valueOf(user.getString("user_role"));
		err = Validator.unauthorized(role ,new Role []{Role.ADMIN});
		if (err != null) return err;

		datastore.delete(userKeyToBeDeleted);
		deleteAllSessionsForUser(userJson.getUsername());

		return Response.ok(
			Map.of(
				"status", "success",
				"data", Map.of("message", "Account deleted successfully")
			)
		).build();

	}

	public Response modifyAccountAttributes(ModAccountRequest request){
		return null;
	}

	@POST
	@Path("/modaccount")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response modifyAccount(ModAccountRequest request) {

		ModAccountRequest.Input input = request.getInput();
		ModAccountRequest.Attributes attributes = request.getInput().getAttributes();
		String username = input.getUsername();
		Token tokenJson = request.getToken();

		Key userKey = datastore.newKeyFactory().setKind("User").newKey(username);
		Entity user = datastore.get(userKey);

		Key tokenKey = datastore.newKeyFactory().setKind("Session").newKey(tokenJson.getTokenId());
		Entity token = datastore.get(tokenKey);

		Response err = Validator.userNotFound(new Entity[]{user});
		if (err != null) return err;

		err = Validator.invalidToken(token, tokenJson.getUsername());
		if (err != null) return err;

		err = Validator.tokenExpired(token);
		if (err != null) {
			datastore.delete(tokenKey);
			return err;
		}

		String requesterUsername = token.getString("user_name");
		Role requesterRole = Role.valueOf(token.getString("role"));
		Role targetRole = Role.valueOf(user.getString("user_role"));

		if (requesterRole == Role.USER && !requesterUsername.equals(username)) {
			return Validator.unauthorized(requesterRole, new Role[]{Role.USER});
		}

		if (requesterRole == Role.BOFFICER &&
			(!requesterUsername.equals(username) || targetRole == Role.USER)) {
			return Validator.unauthorized(requesterRole, new Role[]{Role.BOFFICER});
		}

		Entity updatedUser = Entity.newBuilder(user)
				.set("user_address", attributes.getAddress())
				.set("user_phone", attributes.getPhone())
				.build();

		datastore.put(updatedUser);

		return Response.ok(Map.of(
				"status", "success",
				"data", Map.of("message", "Updated successfully")
		)).build();
	}

	@POST
	@Path("/showuserrole")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
	public Response showUserRole (ShowUsersRequest request){
		try{
			User userJson = request.getInput();
			Token tokenJson = request.getToken();

			Key userKey = datastore.newKeyFactory()
			.setKind("User")
			.newKey(userJson.getUsername());

			Entity user = datastore.get(userKey);

			Response err = Validator.userNotFound(new Entity []{user});
			if(err != null){ return err;}

			Key tokenKey = datastore.newKeyFactory()
			.setKind("Session")
			.newKey(tokenJson.getTokenId());

			Entity token = datastore.get(tokenKey);


			err = Validator.invalidToken(token,tokenJson.getUsername());
			if(err != null){ return err;}

			err = Validator.tokenExpired(token);
			if(err != null){ 
				datastore.delete(tokenKey);
				return err;
			}


			Role role = Role.valueOf(token.getString("role"));
			err = Validator.unauthorized(role, new Role [] {Role.ADMIN, Role.BOFFICER});
			if(err != null){return err;}

			return Response.ok()
					.entity(Map.of(
							"status", "success",
							"data", Map.of(
									"username", user.getString("user_name"),
									"role", user.getString("user_role")
							)
					))
					.build();

		} catch (Exception e) {
			return Validator.forbidden();
		}
	}

	@POST
	@Path("/logout")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
	public Response logOut(LogOutRequest request){ // Não tem erro USER_NOT_FOUND ou seja user mandado existe sempre
		try{
			User userJson = request.getInput();
			Token tokenJson = request.getToken();

			Key userKey = datastore.newKeyFactory()
			.setKind("User")
			.newKey(userJson.getUsername());

			Entity user = datastore.get(userKey);

			Key tokenKey = datastore.newKeyFactory()
			.setKind("Session")
			.newKey(tokenJson.getTokenId());

			Entity token = datastore.get(tokenKey);


			Response err = Validator.invalidToken(token,tokenJson.getUsername());
			if(err != null){ return err;}

			String sessionOwner = token.getString("user_name");
			String requester = user.getString("user_name");


			err = Validator.tokenExpired(token);

			if(err != null){ 
				datastore.delete(tokenKey);
				return err;
			}


			Role role = Role.valueOf(user.getString("user_role"));

			if (!sessionOwner.equals(requester) && role != Role.ADMIN) {
				err = Validator.unauthorized(role, new Role[]{Role.ADMIN});
				if(err != null){ return err;}
			}

			datastore.delete(tokenKey);
			

		} catch (Exception e) {
			return Validator.forbidden();
		}
		return Response.ok(Map.of(
			"status","success",
			"data", Map.of("message", "Logout successful")
		)
		).build();
	}

	@POST
	@Path("/changeuserrole")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
	public Response changeUserRole(ChangeUserRole request) {
		try{
			ChangeUserRole.Input input = request.getInput();
			Token tokenJson = request.getToken();

			Key userKey = datastore.newKeyFactory()
			.setKind("User")
			.newKey(input.getUsername());

			Entity user = datastore.get(userKey);

			Response err = Validator.userNotFound(new Entity []{user});
			if(err != null){ return err;}

			Key tokenKey = datastore.newKeyFactory()
			.setKind("Session")
			.newKey(tokenJson.getTokenId());

			Entity token = datastore.get(tokenKey);


			err = Validator.invalidToken(token,tokenJson.getUsername());
			if(err != null){ return err;}

			err = Validator.tokenExpired(token);
			if(err != null){ 
				datastore.delete(tokenKey);
				return err;
			}


			Role role = Role.valueOf(token.getString("role"));
			err = Validator.unauthorized(role, new Role [] {Role.ADMIN});
			if(err != null){return err;}

			Role newRole = Role.valueOf(input.getNewrole());

			Entity updatedUser = Entity.newBuilder(user)
			.set("user_role", newRole.name())
			.build();

			datastore.put(updatedUser);
			updateUserTokensRole(input.getUsername(),input.getNewrole());

			return Response.ok()
					.entity(Map.of(
							"status", "success",
							"data", Map.of(
							"message", "Role updated successfully"
							)
					))
					.build();

		} catch (Exception e) {
			return Validator.forbidden();
		}
	}

	@POST
	@Path("/changeuserpwd")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
	public Response changeUserPassword(ChangeUserPasswordRequest request) {
		try{
			ChangeUserPasswordRequest.PasswordInput input = request.getInput();
			Token tokenJson = request.getToken();

			Key userKey = datastore.newKeyFactory()
			.setKind("User")
			.newKey(input.getUsername());

			Entity user = datastore.get(userKey);

			Response err = Validator.userNotFound(new Entity []{user});
			if(err != null){ return err;}

			Key tokenKey = datastore.newKeyFactory()
			.setKind("Session")
			.newKey(tokenJson.getTokenId());

			Entity token = datastore.get(tokenKey);


			err = Validator.invalidToken(token,tokenJson.getUsername());
			if(err != null){ return err;}

			err = Validator.tokenExpired(token);
			if(err != null){ 
				datastore.delete(tokenKey);
				return err;
			}

			if(!token.getString("user_name").equals(user.getString("user_name"))){
				Role role = Role.valueOf(token.getString("role"));
				err = Validator.unauthorized(role, new Role [] {Role.ADMIN});
				if(err != null){return err;}
			}

			String oldPwdHash = DigestUtils.sha512Hex(input.getOldpassword());
			 if (!oldPwdHash.equals(user.getString("user_pwd"))) {
				return Validator.forbidden();
			}

			Entity updatedUser = Entity.newBuilder(user)
                .set("user_pwd", DigestUtils.sha512Hex(input.getNewpassword()))
                .build();
        	datastore.put(updatedUser);

			return Response.ok()
					.entity(Map.of(
							"status", "success",
							"data", Map.of("message", "Password changed successfully")
							)
					)
					.build();

		} catch (Exception e) {
			return Validator.forbidden();
		}
	}


	@POST
	@Path("/showauthsessions")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
	public Response showAuthsessions (ShowSessionsRequest request){
		try{
			Token tokenJson = request.getToken();

			Key tokenKey = datastore.newKeyFactory()
			.setKind("Session")
			.newKey(tokenJson.getTokenId());

			Entity token = datastore.get(tokenKey);


			Response err = Validator.invalidToken(token,tokenJson.getUsername());
			if(err != null){ return err;}

			err = Validator.tokenExpired(token);
			if(err != null){ 
				datastore.delete(tokenKey);
				return err;
			}

			Role role = Role.valueOf(token.getString("role"));
			err = Validator.unauthorized(role, new Role [] {Role.ADMIN});
			if(err != null){return err;}

			List<Map<String, Object>> allSessions = getAllSessions();

			return Response.ok(
			Map.of(
				"status", "success",
				"data", Map.of("tokens", allSessions)
			)
		).build();

		} catch (Exception e){
			return Validator.forbidden();
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
				"tokenID", session.getString("token_id"),
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

		List<Entity> updatedSessions = new ArrayList<>();

		while (sessions.hasNext()) {
			Entity session = sessions.next();
			Entity updated = Entity.newBuilder(session)
					.set("role", newRole) // atualiza o role
					.build();
			datastore.put(updated);
		}
	}

}