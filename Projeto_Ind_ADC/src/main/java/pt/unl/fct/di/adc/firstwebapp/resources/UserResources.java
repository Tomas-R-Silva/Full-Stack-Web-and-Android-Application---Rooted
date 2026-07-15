package pt.unl.fct.di.adc.firstwebapp.resources;

import java.util.ArrayList;
import java.util.HashMap;
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
import com.google.cloud.datastore.StructuredQuery.CompositeFilter;
import com.google.cloud.datastore.StructuredQuery.PropertyFilter;
import com.google.cloud.datastore.Key;
import com.google.cloud.datastore.Query;
import com.google.cloud.datastore.QueryResults;
import com.google.cloud.datastore.StructuredQuery;
import com.google.cloud.datastore.Transaction;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces; // <-- THIS ONE
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import pt.unl.fct.di.adc.firstwebapp.Objects.TokenFull;
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
	private static final Datastore datastore = DatastoreOptions.newBuilder()
			.setProjectId("adc-final")
			.build()
			.getService();

	private static Logger Log = Logger.getLogger(UserResources.class.getName());

	public UserResources() {
	}

	@POST
	@Path("/createaccount")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response createAccount(UserRequest request) {
		Transaction txn = datastore.newTransaction();
		try {

			User user = request.getInput();
			Log.info("Attempt to register user: " + user.getUsername());
			user.userValidation();
			Key userKey = datastore.newKeyFactory().setKind("User").newKey(user.getUsername());

			if (txn.get(userKey) != null)
				ErrorException.trow(9901);
			txn.put(UserFull.newuser(user, userKey).toentity());
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

			String jwtString = JWTToken.createJWT(user.getString("user_name"),
					Map.of("role", Role.valueof(user.getString("user_role")).name()));
			DecodedJWT decoded = JWTToken.decodeUnsafe(jwtString);

			TokenFull token = JWTToken.filltoken(jwtString, decoded);
			Key sessionKey = datastore.newKeyFactory().setKind("Session").newKey(jwtString);
			Entity sessionEntity = Entity.newBuilder(sessionKey)
					.set("jwt", jwtString)
					.set("user_name", token.getUsername())
					.set("role", token.getRoleString())
					.set("issued_at", token.getIssuedAt() / TIME_DIVIDER)
					.set("expires_at", token.getExpiresAt() / TIME_DIVIDER)
					.build();
			datastore.put(sessionEntity);
			return buildresponse(Map.of("token", TokenFull.getfromcloud(sessionEntity).tomap()));
		} catch (Exception e) {
			return Error.fromexception(e);
		}

	}

	@POST
	@Path("/showusers")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response showUsers(TokenRequest request) {
		try {
			TokenFull token = AuthHelper.verifyToken(request);

			Validator.unauthorized(token, new Role[] { Role.ADMIN, Role.BOFFICER });

			Query<Entity> query = Query.newEntityQueryBuilder().setKind("User").build();

			QueryResults<Entity> results = datastore.run(query);

			List<Map<String, String>> users = new ArrayList<>();

			while (results.hasNext()) {
				Entity e = results.next();
				Map<String, String> u = new HashMap<>();
				u.put("username", e.contains("user_name") ? e.getString("user_name") : null);
				u.put("display", e.contains("user_display") ? e.getString("user_display") : null);
				u.put("email", e.contains("user_email") ? e.getString("user_email") : null);
				u.put("role", e.contains("user_role") ? e.getString("user_role") : null);
				users.add(u);
			}
			return buildresponse(Map.of("users", users));
		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/deleteaccount")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response deleteAccount(ShortUserTokenRequest request) {
		try {
			TokenFull token = AuthHelper.verifyToken(request);
			Entity user = AuthHelper.getUser(request.getInput());
			Key userKeyToBeDeleted = user.getKey();

			if (!token.getUsername().equals(user.getString("user_name")))
				Validator.unauthorized(token, new Role[] { Role.ADMIN });

			datastore.delete(userKeyToBeDeleted);
			deleteAllSessionsForUser(user.getString("user_name"));
			return buildresponse(Map.of("message", "Account deleted successfully"));
		} catch (Exception e) {
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
			TokenFull token = AuthHelper.verifyToken(request);
			Entity user = AuthHelper.getUser(token);
			Builder updatedUser = Entity.newBuilder(user);
			if (input.getUsername() != null
					&& (user.contains("user_display") || !user.getString("user_display").equals(input.getUsername()))) {
				updatedUser.set("user_display", input.getUsername());
				List<StringValue> list = (user.contains("old_display")) ? user.getList("old_display")
						: new ArrayList<>(1);
				if (!user.contains("old_display"))
					list.add(StringValue.of(user.getString("user_name")));
				StringValue news = StringValue.of(input.getUsername());
				if (!list.contains(news)) {
					list.add(news);
					updatedUser.set("old_display", list);
				}
			}
			if (input.getEmail() != null && !user.getString("user_email").equals(input.getEmail()))
				updatedUser.set("user_email", input.getEmail());
			if (input.getBio() != null)
				updatedUser.set("user_bio", input.getBio());
			datastore.put(updatedUser.build());
			return buildresponse(Map.of("message", "Updated successfully"));
		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/user")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getAccount(ShortUserTokenRequest request) {
		try {
			TokenFull token = AuthHelper.verifyToken(request);
			Entity user = AuthHelper.getUser(request.getInput());
			String displayname = (user.contains("user_display")) ? user.getString("user_display")
					: user.getString("user_name");
			Friendstatus friendshipstatus;
			if (user.getString("user_name").equals(token.getUsername()))
				friendshipstatus = Friendstatus.SELF;
			else {
				Entity friend = datastore.get(getFriendKey(token, user));
				if (friend == null)
					friendshipstatus = Friendstatus.NOT_FRIENDS;
				else if (friend.getBoolean("accepted")) {
					friendshipstatus = Friendstatus.FRIENDS;
					String ke = (friend.getString("username_1").equals(user.getString("user_name"))) ? "nickname_1"
							: "nickname_2";
					if (friend.contains(ke))
						displayname = friend.getString(ke);
				} else if (friend.getString("username_1").equals(token.getUsername()))
					friendshipstatus = Friendstatus.REQUEST_SENT;
				else
					friendshipstatus = Friendstatus.REQUEST_RECIVED;
			}
			List<StringValue> list = user.contains("old_display") ? user.getList("old_display") : new ArrayList<>(0);
			List<String> newlist = new ArrayList<>(list.size());
			for (StringValue v : list)
				newlist.add(v.get());
			return buildresponse(
					Map.of("username", user.getString("user_name"),
							"email", user.getString("user_email"),
							"role", user.getString("user_role"),
							"creation_time", user.contains("user_creation_time")
									? user.getTimestamp("user_creation_time").getSeconds()
									: 0L,
							"display", displayname,
							"oldnames", newlist,
							"friendship", friendshipstatus.toString(),
							"bio", user.contains("user_bio") ? user.getString("user_bio") : ""));
		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/find")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response findAccount(ShortUserTokenRequest request) {
		try {
			TokenFull token = AuthHelper.verifyToken(request);
			// Entity user = AuthHelper.getUser(request.getInput());
			// TODO

			EntityQuery.Builder queryBuilder = Query.newEntityQueryBuilder().setKind("User");
			queryBuilder.setFilter(PropertyFilter.eq("user_display", request.getInput().getUsername()));
			QueryResults<Entity> sessions = datastore.run(queryBuilder.build());

			return null;
		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/showuserrole")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response showUserRole(ShortUserTokenRequest request) {
		try {
			TokenFull token = AuthHelper.verifyToken(request);
			Entity user = AuthHelper.getUser(request.getInput());
			Validator.unauthorized(token, new Role[] { Role.ADMIN, Role.BOFFICER });
			return buildresponse(Map.of(
					"username", user.getString("user_name"),
					"display", user.getString("user_display"),
					"email", user.contains("user_email") ? user.getString("user_email") : "",
					"role", user.getString("user_role")));
		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/logout")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response logOut(ShortUserTokenRequest request) {
		try {
			TokenFull token = AuthHelper.verifyToken(request);
			Entity user = AuthHelper.getUser(request.getInput());

			if (!token.getUsername().equals(user.getString("user_name")))
				Validator.unauthorized(token, new Role[] { Role.ADMIN });

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
		try {
			ChangeUserRoleInput input = request.getInput();
			Entity user = AuthHelper.getUser(input);
			TokenFull token = AuthHelper.verifyToken(request);
			Validator.unauthorized(token, new Role[] { Role.ADMIN });
			Role newRole = Role.valueof(input.getNewrole());
			Entity updatedUser = Entity.newBuilder(user)
					.set("user_role", newRole.name())
					.build();

			datastore.put(updatedUser);
			// JWT role is embedded in the token — invalidate all sessions so user re-logs
			// with new role
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
		try {
			PasswordInput input = request.getInput();
			Entity user = AuthHelper.getUser(input.getUsername());
			TokenFull token = AuthHelper.verifyToken(request);

			if (!token.getUsername().equals(user.getString("user_name")))
				Validator.unauthorized(token, new Role[] { Role.ADMIN });

			String oldPwdHash = DigestUtils.sha512Hex(input.getOldpassword());
			if (!oldPwdHash.equals(user.getPassword()))
				ErrorException.trow(9907);
			user.setPassword(input.getNewpassword());
			datastore.put(user.toentity());
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
		try {// TODO
			PasswordInput input = request.getInput();

			Entity user = AuthHelper.getUser(input);
			TokenFull token = AuthHelper.verifyToken(request);

			if (!token.getUsername().equals(user.getString("user_name")))
				Validator.unauthorized(token, new Role[] { Role.ADMIN });

			String oldPwdHash = DigestUtils.sha512Hex(input.getOldpassword());
			if (!oldPwdHash.equals(user.getPassword()))
				ErrorException.trow(9907);
			user.setPassword(input.getNewpassword());
			datastore.put(user.toentity());
			return buildresponse(Map.of("message", "Password changed successfully"));

		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/showauthsessions")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response showAuthsessions(TokenRequest request) {
		try {
			TokenFull token = AuthHelper.verifyToken(request);
			Validator.unauthorized(token, new Role[] { Role.ADMIN });
			return buildresponse(Map.of("tokens", getAllSessions()));

		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/endfriend")
	@Produces(MediaType.APPLICATION_JSON)
	public Response endFriend() throws ErrorException {
		QueryResults<Entity> sessions = datastore.run(Query.newEntityQueryBuilder().setKind("Friend").build());
		while (sessions.hasNext())
			datastore.delete(sessions.next().getKey());
		return buildresponse(Map.of("message", "ALL UNFRIEND"));
	}

	@POST
	@Path("/addfriend")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response addFriend(ShortUserTokenRequest request) throws ErrorException {
		Transaction txn = datastore.newTransaction();
		try {
			TokenFull token = AuthHelper.verifyToken(request);
			UserFull user = AuthHelper.getUser(request.getInput());
			Key friendKey = FriendFull.getFriendKey(token, user);
			Entity existingfriend = txn.get(friendKey);

			if (existingfriend == null) {
				FriendFull friend = FriendFull.newfriends(token, user);
				txn.put(friend.toentity());
				txn.commit();
				return buildresponse(Map.of("message", "Friend Request Sent"));
			} else {
				FriendFull friend = FriendFull.fromdatabase(existingfriend);
				if (friend.getAccepted())
					ErrorException.trow(9926);
				else {
					if (existingfriend.getString("username_1").equals(token.getUsername()))
						ErrorException.trow(9927);
					else
						datastore.put(Entity.newBuilder(existingfriend).set("accepted", true)
								.set("issued_at", System.currentTimeMillis() / TIME_DIVIDER).build());
				}
			}
			return buildresponse(Map.of("message", "Friend Request Accepted"));
		} catch (Exception e) {
			txn.rollback();
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/addnickname")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response addnickname(TwoNameTokenRequest request) throws ErrorException {
		try {
			TokenFull token = AuthHelper.verifyToken(request);
			Entity user = AuthHelper.getUser(request.getInput());
			Entity existingfriend = datastore.get(getFriendKey(token, user));
			if (existingfriend == null || !existingfriend.getBoolean("accepted"))
				ErrorException.trow(9934);
			String friend = existingfriend.getString("username_1").equals(token.getUsername()) ? "nickname_1"
					: "nickname_2";
			datastore.put(Entity.newBuilder(existingfriend).set(friend, request.getInput().getNewName()).build());
			return buildresponse(Map.of("message", "Friend Nickname Set"));
		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/unfriend")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response unfriend(ShortUserTokenRequest request) {
		try {
			Entity user = AuthHelper.getUser(request.getInput());
			TokenFull token = AuthHelper.verifyToken(request);
			datastore.delete(getFriendKey(token, user));
			return buildresponse(Map.of("message", "Friendship Ended"));
		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/showfriends")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response showFriends(ShortUserTokenRequest request) {
		final String friend = "Friend", start = "Start";
		try {
			String username = AuthHelper.getUser(request.getInput()).getString("user_name");
			AuthHelper.verifyToken(request);
			List<Map<String, Object>> friends = new LinkedList<>();
			EntityQuery.Builder queryBuilder = Query.newEntityQueryBuilder().setKind("Friend");
			queryBuilder.setFilter(PropertyFilter.eq("accepted", true));
			QueryResults<Entity> sessions = datastore.run(queryBuilder.build());
			while (sessions.hasNext()) {
				Entity session = sessions.next();
				String friend1 = session.getString("username_1"),
						friend2 = session.getString("username_2");
				if (friend1.equals(username))
					friends.add(Map.of(friend, friend2, start, session.getLong("issued_at") * TIME_DIVIDER));
				else if (friend2.equals(username))
					friends.add(Map.of(friend, friend1, start, session.getLong("issued_at") * TIME_DIVIDER));
			}
			return buildresponse(Map.of("friends", friends));
		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/showfriendrequests")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response showFriendRequests(TokenRequest request) {
		try {
			TokenFull token = AuthHelper.verifyToken(request);
			List<Map<String, Object>> friends = new LinkedList<>();
			EntityQuery.Builder queryBuilder = Query.newEntityQueryBuilder().setKind("Friend");
			queryBuilder.setFilter(CompositeFilter.and(
					PropertyFilter.eq("accepted", false),
					PropertyFilter.eq("username_2", token.getUsername())));
			QueryResults<Entity> sessions = datastore.run(queryBuilder.build());
			while (sessions.hasNext()) {
				Entity session = sessions.next();
				friends.add(Map.of("From", session.getString("username_1"), "Sent at",
						session.getLong("issued_at") * TIME_DIVIDER));
			}
			return buildresponse(Map.of("friends", friends));
		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	private List<Map<String, Object>> getAllSessions() {
		Query<Entity> query = Query.newEntityQueryBuilder()
				.setKind("Session")
				.build();

		QueryResults<Entity> sessions = datastore.run(query);
		List<Map<String, Object>> tokensOutput = new LinkedList<>();

		while (sessions.hasNext()) {
			Entity session = sessions.next();
			TokenFull token = TokenFull.getfromcloud(session);
			if (token.isexpierd())
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

		// List<Entity> updatedSessions = new ArrayList<>();

		while (sessions.hasNext()) {
			Entity session = sessions.next();
			Entity updated = Entity.newBuilder(session)
					.set("role", newRole) // atualiza o role
					.build();
			datastore.put(updated);
		}
	}

	private static Response buildresponse(Map<String, Object> map) {
		return ResponceBuilder.constructorsuccess(map);
	}

	private Key getFriendKey(TokenFull token, Entity user) throws ErrorException {
		int compare = user.getString("user_name").compareTo(token.getUsername());
		if (compare == 0)
			ErrorException.trow(9925);
		String f1, f2;
		if ((compare > 0)) {
			f1 = user.getString("user_name");
			f2 = token.getUsername();
		} else {
			f2 = user.getString("user_name");
			f1 = token.getUsername();
		}
		return datastore.newKeyFactory().setKind("Friend").newKey(String.format("%s@@@%s", f1, f2));

	}

}