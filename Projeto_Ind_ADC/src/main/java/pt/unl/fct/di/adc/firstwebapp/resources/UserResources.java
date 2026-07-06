package pt.unl.fct.di.adc.firstwebapp.resources;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import org.apache.commons.codec.digest.DigestUtils;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.google.cloud.Timestamp;
import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.EntityQuery;
import com.google.cloud.datastore.Entity.Builder;
import com.google.cloud.datastore.StructuredQuery.PropertyFilter;
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
import pt.unl.fct.di.adc.firstwebapp.Objects.Token;
import pt.unl.fct.di.adc.firstwebapp.Objects.User;
import pt.unl.fct.di.adc.firstwebapp.Objects.User.Friendstatus;
import pt.unl.fct.di.adc.firstwebapp.Objects.User.Role;
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
import pt.unl.fct.di.adc.firstwebapp.model.LoginRequest;
import pt.unl.fct.di.adc.firstwebapp.model.LoginRequest.LoginRequestInput;
import pt.unl.fct.di.adc.firstwebapp.model.ModAccountRequest;
import com.google.cloud.datastore.StringValue;
import pt.unl.fct.di.adc.firstwebapp.model.ModAccountRequest.ModAccountRequestInput;
import pt.unl.fct.di.adc.firstwebapp.model.ShortUserTokenRequest;
import pt.unl.fct.di.adc.firstwebapp.model.TokenRequest;
import pt.unl.fct.di.adc.firstwebapp.model.TwoNameTokenRequest;
import pt.unl.fct.di.adc.firstwebapp.model.UserRequest;


@Path("/")
public class UserResources {
	private static final long TIME_DIVIDER = 1000L;
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
	public Response createAccount(UserRequest request) {
		Transaction txn = datastore.newTransaction();
		try {

			User user = request.getInput();
			Log.info("Attempt to register user: " + user.getUsername());

			Key userKey = datastore.newKeyFactory().setKind("User").newKey(user.getUsername());
			Entity existingUser = txn.get(userKey);

			if (existingUser != null) ErrorException.trow(9901);

			List<StringValue> listnames = new ArrayList<>(1),
					listtokens = new ArrayList<>(0),
					listcategory = new ArrayList<>(0);
			listnames.add(StringValue.of(user.getUsername()));


			user.userValidation();
			Entity newUser = Entity.newBuilder(userKey)
					.set("user_name", user.getUsername())
					.set("user_email", user.getEmail())
					.set("user_pwd", DigestUtils.sha512Hex(user.getPassword()))
					.set("user_role", user.getRole().name())
					.set("user_display", user.getUsername())
					.set("old_display", listnames)
					.set("user_creation_time", Timestamp.now())
					.set("tokens", listtokens)
					.set("category", listcategory)
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

			Entity user = AuthHelper.getUser(userToLog);

			Validator.invalidCredencials(userToLog.getPassword(), user.getString("user_pwd"));

			String jwtString = JWTToken.createJWT(user.getString("user_name"), Map.of("role", Role.valueof(user.getString("user_role")).name()));
			DecodedJWT decoded = JWTToken.decodeUnsafe(jwtString);
			
			Token token =JWTToken.filltoken(jwtString,decoded);
			Key sessionKey = datastore.newKeyFactory().setKind("Session").newKey(jwtString);
			Entity sessionEntity = Entity.newBuilder(sessionKey)
					.set("jwt", jwtString)
					.set("user_name", token.getUsername())
					.set("role", token.getRoleString())
					.set("issued_at", token.getIssuedAt()/TIME_DIVIDER)
					.set("expires_at", token.getExpiresAt()/TIME_DIVIDER)
					.build();
			datastore.put(sessionEntity);
			return buildresponse(Map.of("token", Token.getfromcloud(sessionEntity).tomap()));
		}catch(Exception e) {
			return Error.fromexception(e);
		}

	}

	@POST
	@Path("/showusers")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response showUsers(TokenRequest request) {
		try {
			Token token = AuthHelper.verifyToken(request);

			Validator.unauthorized(token, new Role[] {Role.ADMIN, Role.BOFFICER});

			Query<Entity> query = Query.newEntityQueryBuilder().setKind("User").build();

			QueryResults<Entity> results = datastore.run(query);

			List<Map<String, String>> users = new ArrayList<>();

			while (results.hasNext()) {
				Entity e = results.next();
				users.add(Map.of(
						"username", e.getString("user_name"),
						"display", e.getString("user_display"),
						"email", e.contains("user_email") ? e.getString("user_email") : "",
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
	public Response deleteAccount(ShortUserTokenRequest request){
		try {
			Token token = AuthHelper.verifyToken(request);
			Entity user = AuthHelper.getUser(request.getInput());
			Key userKeyToBeDeleted = user.getKey();	

			if(!token.getUsername().equals(user.getString("user_name")))
				Validator.unauthorized(token, new Role []{Role.ADMIN});

			datastore.delete(userKeyToBeDeleted);
			deleteAllSessionsForUser(user.getString("user_name"));
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
			Token token = AuthHelper.verifyToken(request);
			Entity user = AuthHelper.getUser(token);
			Builder updatedUser = Entity.newBuilder(user);
			if(input.getUsername()!=null&&!user.getString("user_display").equals(input.getUsername())) {
				updatedUser.set("user_display", input.getUsername());
				List<StringValue> list = user.getList("old_display");
				StringValue news=StringValue.of(input.getUsername());
				if(!list.contains(news)) {
					list.add(news);
					updatedUser.set("old_display", list);
				}
			}
			if(input.getEmail()!=null&&!user.getString("user_email").equals(input.getEmail()))
				updatedUser.set("user_email", input.getEmail());	
			datastore.put(updatedUser.build());


			return buildresponse(Map.of("message", "Updated successfully"));
		}catch(Exception e) {
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/user")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getAccount(ShortUserTokenRequest request) {
		try {
			Token token = AuthHelper.verifyToken(request);
			Entity user = AuthHelper.getUser(request.getInput());
			Entity friend=datastore.get(getFriendKey(token,user));
			Friendstatus friendshipstatus;
			if(user.getString("user_name").equals(token.getUsername())) 
				friendshipstatus=Friendstatus.SELF;
			else if(friend!=null) 
				if(friend.getBoolean("accepted"))
					friendshipstatus=Friendstatus.FRIENDS;
				else if(friend.getString("username_1").equals(token.getUsername()))
					friendshipstatus=Friendstatus.REQUEST_SENT;
				else
					friendshipstatus=Friendstatus.REQUEST_RECIVED;
			else
				friendshipstatus=Friendstatus.NOT_FRIENDS;
			String displayname=user.getString("user_display");
			if(friendshipstatus==Friendstatus.FRIENDS) {
				String temp=friend.getString((friend.getString("username_1").equals(token.getUsername()))?"nickname_1":"nickname_2");
				if(temp!=null)
					displayname=temp;
			}
			List<StringValue> list = user.getList("old_display");
			List<String> newlist=new ArrayList<>(list.size());
			for(StringValue v:list) newlist.add(v.get());
			return buildresponse(
					Map.of("username", user.getString("user_name"),
							"email", user.getString("user_email"),
							"role", user.getString("user_role"),
							"creation_time",user.getLong("user_creation_time"),
							"display",displayname,
							"oldnames",newlist,
							"friendship",friendshipstatus.toString()
							));
		}catch(Exception e) {
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/find")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response findAccount(ShortUserTokenRequest request) {
		try {
			Token token = AuthHelper.verifyToken(request);
			//Entity user = AuthHelper.getUser(request.getInput());
			//TODO

			EntityQuery.Builder queryBuilder = Query.newEntityQueryBuilder().setKind("User");
			queryBuilder.setFilter(PropertyFilter.eq("user_display", request.getInput().getUsername()));
			QueryResults<Entity> sessions = datastore.run(queryBuilder.build());


			return null;
		}catch(Exception e) {
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/showuserrole")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response showUserRole (ShortUserTokenRequest request){
		try{
			Token token = AuthHelper.verifyToken(request);
			Entity user = AuthHelper.getUser(request.getInput());
			Validator.unauthorized(token, new Role [] {Role.ADMIN, Role.BOFFICER});
			return buildresponse(Map.of(
					"username", user.getString("user_name"),
					"display", user.getString("user_display"),
					"email", user.contains("user_email") ? user.getString("user_email") : "",
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
	public Response logOut(ShortUserTokenRequest request){
		try{
			Token token = AuthHelper.verifyToken(request);
			Entity user = AuthHelper.getUser(request.getInput());

			if(!token.getUsername().equals(user.getString("user_name")))
				Validator.unauthorized(token, new Role [] {Role.ADMIN});

			deleteAllSessionsForUser(user.getString("user_name"));
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
			Entity user = AuthHelper.getUser(input);
			Token token = AuthHelper.verifyToken(request);
			Validator.unauthorized(token, new Role[] {Role.ADMIN});
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
			Entity user = AuthHelper.getUser(input.getUsername());
			Token token = AuthHelper.verifyToken(request);

			if(!token.getUsername().equals(user.getString("user_name")))
				Validator.unauthorized(token, new Role[] {Role.ADMIN});

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
	@Path("/forgotuserpwd")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response forgotUserPassword(ChangeUserPasswordRequest request) {
		try{//TODO
			PasswordInput input = request.getInput();

			Entity user = AuthHelper.getUser(input);
			Token token = AuthHelper.verifyToken(request);

			if(!token.getUsername().equals(user.getString("user_name")))
				Validator.unauthorized(token, new Role[] {Role.ADMIN});

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
	public Response showAuthsessions(TokenRequest request){
		try{
			Token token = AuthHelper.verifyToken(request);
			Validator.unauthorized(token, new Role[] {Role.ADMIN});
			return buildresponse(Map.of("tokens", getAllSessions()));

		} catch (Exception e){
			return Error.fromexception(e);
		}
	}	

	@POST
	@Path("/addfriend")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response addFriend(ShortUserTokenRequest request) throws ErrorException{
		Transaction txn = datastore.newTransaction();
		try{
			Token token = AuthHelper.verifyToken(request);
			Entity user = AuthHelper.getUser(request.getInput());
			Key friendKey = getFriendKey(token,user);
			Entity existingfriend = txn.get(friendKey);
			if (existingfriend == null) {
				Entity friendrequest = Entity.newBuilder(friendKey)
						.set("username_1", token.getUsername())
						.set("username_2", user.getString("user_name"))
						.set("accepted", false)
						.set("issued_at", Timestamp.now())
						.build();
				txn.put(friendrequest);
				txn.commit();
				return buildresponse(Map.of("message", "Friend Request Sent"));
			}
			else {
				if(existingfriend.getBoolean("accepted")) 
					ErrorException.trow(9926);
				else {
					if(existingfriend.getString("username_1").equals(token.getUsername()))
						ErrorException.trow(9927);
					else
						datastore.put(Entity.newBuilder(existingfriend).set("accepted", true).set("issued_at", Timestamp.now()).build());
				}
			}
			return buildresponse(Map.of("message", "Friend Request Accepted"));
		} catch (Exception e){
			txn.rollback();
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/addnickname")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response addnickname(TwoNameTokenRequest request) throws ErrorException{
		try{
			Token token = AuthHelper.verifyToken(request);
			Entity user = AuthHelper.getUser(request.getInput());
			Entity existingfriend = datastore.get(getFriendKey(token,user));
			if(existingfriend == null || !existingfriend.getBoolean("accepted"))
				ErrorException.trow(9934);
			String friend=existingfriend.getString("username_1").equals(token.getUsername())?"nickname_1":"nickname_2";
			datastore.put(Entity.newBuilder(existingfriend).set(friend,request.getInput().getNewName()).build());
			return buildresponse(Map.of("message", "Friend Nickname Set"));
		} catch (Exception e){
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/unfriend")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response unfriend(ShortUserTokenRequest request){
		try {
			Entity user = AuthHelper.getUser(request.getInput());
			Token token = AuthHelper.verifyToken(request);
			datastore.delete(getFriendKey(token,user));
			return buildresponse(Map.of("message", "Friendship Ended"));
		}catch(Exception e) {
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/showfriends")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response showFriends(ShortUserTokenRequest request){
		final String friend="Friend",start="Start";	
		try{
			String username=AuthHelper.getUser(request.getInput()).getString("user_name");
			AuthHelper.verifyToken(request);
			List<Map<String, Object>> friends = new LinkedList<>();
			EntityQuery.Builder queryBuilder = Query.newEntityQueryBuilder().setKind("Friend");
			List<StructuredQuery.Filter> filters = new ArrayList<>(1);
			filters.add(PropertyFilter.eq("accepted", true));

			QueryResults<Entity> sessions = datastore.run(queryBuilder.build());
			while(sessions.hasNext()){
				Entity session = sessions.next();
				String friend1=session.getString("username_1"),
						friend2=session.getString("username_2");
				if(friend1.equals(username))
					friends.add(Map.of(friend, friend2,start, session.getLong("issued_at")));
				else if(friend2.equals(username))
					friends.add(Map.of(friend, friend1,start, session.getLong("issued_at")));
			}
			return buildresponse(Map.of("friends", friends));
		} catch (Exception e){
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/showfriendrequests")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response showFriendRequests(TokenRequest request){
		try{
			Token token = AuthHelper.verifyToken(request);
			List<Map<String, Object>> friends = new LinkedList<>();
			EntityQuery.Builder queryBuilder = Query.newEntityQueryBuilder().setKind("Friend");
			List<StructuredQuery.Filter> filters = new ArrayList<>(2);
			filters.add(PropertyFilter.eq("accepted", false));
			filters.add(PropertyFilter.eq("username_2", token.getUsername()));
			QueryResults<Entity> sessions = datastore.run(queryBuilder.build());
			while(sessions.hasNext()) {
				Entity session = sessions.next();
				friends.add(Map.of("From", session.getString("username_1"),"Sent at", session.getLong("issued_at")));
			}
			return buildresponse(Map.of("friends", friends));
		} catch (Exception e){
			return Error.fromexception(e);
		}
	}

	private List<Map<String, Object>> getAllSessions(){
		Query<Entity> query = Query.newEntityQueryBuilder()
				.setKind("Session")
				.build();

		QueryResults<Entity> sessions = datastore.run(query);
		List<Map<String, Object>> tokensOutput = new LinkedList<>();

		while(sessions.hasNext()) {
			Entity session=sessions.next();
			Token token=Token.getfromcloud(session);
			if(token.isexpierd())
				datastore.delete(session.getKey());
			else
				tokensOutput.add(token.tomap());
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
		return ResponceBuilder.constructorsuccess(map);
	}

	private Key getFriendKey(Token token,Entity user) throws ErrorException{
		int compare=user.getString("user_name").compareTo(token.getUsername());
		if(compare==0)
			ErrorException.trow(9925);
		String f1,f2;
		if((compare>0)) {
			f1=user.getString("user_name");
			f2=token.getUsername();
		}else{
			f2=user.getString("user_name");
			f1=token.getUsername();
		}
		return datastore.newKeyFactory().setKind("Friend").newKey(String.format("%s@@@%s", f1,f2));

	}



}