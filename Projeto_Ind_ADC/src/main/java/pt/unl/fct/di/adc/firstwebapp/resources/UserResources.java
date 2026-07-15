package pt.unl.fct.di.adc.firstwebapp.resources;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import org.apache.commons.codec.digest.DigestUtils;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.EntityQuery;
import com.google.cloud.datastore.Key;
import com.google.cloud.datastore.Query;
import com.google.cloud.datastore.QueryResults;
import com.google.cloud.datastore.StructuredQuery.CompositeFilter;
import com.google.cloud.datastore.StructuredQuery.PropertyFilter;
import com.google.cloud.datastore.Transaction;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;   // <-- THIS ONE
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import pt.unl.fct.di.adc.firstwebapp.Objects.AttendanceFull;
import pt.unl.fct.di.adc.firstwebapp.Objects.EventFull;
import pt.unl.fct.di.adc.firstwebapp.Objects.FriendFull;
import pt.unl.fct.di.adc.firstwebapp.Objects.TokenFull;
import pt.unl.fct.di.adc.firstwebapp.Objects.User;
import pt.unl.fct.di.adc.firstwebapp.Objects.User.Friendstatus;
import pt.unl.fct.di.adc.firstwebapp.Objects.User.Role;
import pt.unl.fct.di.adc.firstwebapp.Objects.UserFull;
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
import pt.unl.fct.di.adc.firstwebapp.model.ModAccountRequest.ModAccountRequestInput;
import pt.unl.fct.di.adc.firstwebapp.model.ShortUserTokenRequest;
import pt.unl.fct.di.adc.firstwebapp.model.TokenRequest;
import pt.unl.fct.di.adc.firstwebapp.model.TwoNameTokenRequest;
import pt.unl.fct.di.adc.firstwebapp.model.UserRequest;


@Path("/")
public class UserResources {
	private static final Datastore datastore = DatastoreOptions.newBuilder().setProjectId(AuthHelper.PROJECT_ID).build().getService();

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

			user.userValidation();

			if(txn.get(userKey) != null) ErrorException.trow(9901);

			txn.put(UserFull.newuser(user,userKey).toentity());
			txn.commit();

			Log.info("User registered: " + user.getUsername());
			return buildresponse(Map.of("message", "Account created"));

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
			UserFull user = AuthHelper.getUser(userToLog);
			Validator.invalidCredencials(userToLog.getPassword(), user.getPassword());
			String jwtString = JWTToken.createJWT(user.getUsername(), Map.of("role", user.getRole().name()));
			DecodedJWT decoded = JWTToken.decodeUnsafe(jwtString);
			TokenFull token =JWTToken.filltoken(datastore,jwtString,decoded);
			datastore.put(token.toentity());
			return buildresponse(Map.of("token", token.tomap()));
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
			TokenFull token = AuthHelper.verifyToken(request);
			Validator.unauthorized(token, new Role[] {Role.ADMIN, Role.BOFFICER});
			QueryResults<Entity> results = datastore.run(Query.newEntityQueryBuilder().setKind("User").build());
			List<Map<String, Object>> users = new LinkedList<>();
			while (results.hasNext()) 
				users.add(UserFull.fromdatabase(results.next()).tomap());
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
			TokenFull token = AuthHelper.verifyToken(request);
			UserFull user = AuthHelper.getUser(request.getInput());
			if(!user.isme(token))
				Validator.unauthorized(token, new Role []{Role.ADMIN});
			datastore.delete(user.getKey());
			AuthHelper.querydelete("Session","user_name",user.getUsername());

			AuthHelper.querydelete("EventJoinRequest","requester",user.getUsername());
			AuthHelper.querydelete("EventJoinRequest","organizer",user.getUsername());

			AuthHelper.querydelete("Event","organizer_username",user.getUsername());

			unattendevents(user.getUsername());

			becomeloner(user.getUsername());

			AuthHelper.querydelete("ForumPost","author_username",user.getUsername());


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
			TokenFull token = AuthHelper.verifyToken(request);
			UserFull user = AuthHelper.getUser(token);
			if(input.getUsername()!=null&&!user.getDisplay().equals(input.getUsername())) 
				user.setDisplay(input.getUsername());
			if(input.getEmail()!=null&&!user.getEmail().equals(input.getEmail()))
				user.setEmail(input.getEmail());	
			if(input.getBio()!=null&&!user.getBio().equals(input.getBio()))
				user.setBio(input.getBio());
			if(input.getCategory()!=null)
				user.setbaseCategorystr(input.getCategory());
			if(input.getCountry()!=null&&!user.getCountry().equals(input.getCountry()))
				user.setCountry(input.getCountry());
			if(input.getBirth()!=null&&user.getBirth()!=input.getBirth())
				user.setBirth(input.getBirth());
			datastore.put(user.toentity());
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
			TokenFull token = AuthHelper.verifyToken(request);
			UserFull user = AuthHelper.getUser(request.getInput());
			String displayname=user.getDisplay();
			Friendstatus friendshipstatus;
			if(user.isme(token)) 
				friendshipstatus=Friendstatus.SELF;
			else {
				Entity friendent=datastore.get(FriendFull.getFriendKey(token,user));
				if(friendent==null) 
					friendshipstatus=Friendstatus.NOT_FRIENDS;
				else {
					FriendFull friend=FriendFull.fromdatabase(friendent);
					if(friend.getAccepted()) {
						friendshipstatus = Friendstatus.FRIENDS;
						displayname = friend.getnickname(user);
					}
					friendshipstatus=(friend.getUsername1().equals(token.getUsername()))?
							Friendstatus.REQUEST_SENT:Friendstatus.REQUEST_RECIVED;
				}
			}
			return buildresponse(user.tobigmap(displayname,friendshipstatus));
		}catch(Exception e) {return Error.fromexception(e);}
	}

	@POST
	@Path("/find")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response findAccount(ShortUserTokenRequest request) {
		try {
			AuthHelper.verifyToken(request);
			EntityQuery.Builder queryBuilder = Query.newEntityQueryBuilder().setKind("User").
					setFilter(CompositeFilter.and(
							PropertyFilter.eq("user_display", request.getInput().getUsername())
							,PropertyFilter.eq("is_public", true)));
			QueryResults<Entity> sessions = datastore.run(queryBuilder.build());
			List<Map<String,Object>> list=new LinkedList<>();
			while(sessions.hasNext()) 
				list.add(UserFull.fromdatabase(sessions.next()).tomap());
			try {
				list.add(AuthHelper.getUser(request.getInput()).tomap());
			}catch(ErrorException e) {
				if(e.getStatus()!=9902)
					throw e;
			}
			return buildresponse(Map.of("found",list));
		} catch (Exception e){
			return Error.fromexception(e);
		}
	}

	@POST
	@Path("/showuserrole")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response showUserRole(ShortUserTokenRequest request){
		try{
			TokenFull token = AuthHelper.verifyToken(request);
			UserFull user = AuthHelper.getUser(request.getInput());
			Validator.unauthorized(token, new Role [] {Role.ADMIN, Role.BOFFICER});
			return buildresponse(user.tomap());
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
			TokenFull token = AuthHelper.verifyToken(request);
			UserFull user = AuthHelper.getUser(request.getInput());

			if(!user.isme(token))
				Validator.unauthorized(token, new Role [] {Role.ADMIN});

			AuthHelper.querydelete("Session","user_name",user.getUsername());
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
			UserFull user = AuthHelper.getUser(input);
			TokenFull token = AuthHelper.verifyToken(request);
			Validator.unauthorized(token, new Role[] {Role.ADMIN});
			Role newRole = Role.valueof(input.getNewrole());
			user.setRole(newRole);
			datastore.put(user.toentity());
			// JWT role is embedded in the token — invalidate all sessions so user re-logs with new role
			AuthHelper.querydelete("Session","user_name",user.getUsername());
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
			UserFull user = AuthHelper.getUser(input.getUsername());
			TokenFull token = AuthHelper.verifyToken(request);
			if(!user.isme(token))
				Validator.unauthorized(token, new Role[] {Role.ADMIN});
			String oldPwdHash = DigestUtils.sha512Hex(input.getOldpassword());
			if (!oldPwdHash.equals(user.getPassword())) 
				ErrorException.trow(9941);
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
		try{//TODO
			PasswordInput input = request.getInput();

			UserFull user = AuthHelper.getUser(input);
			TokenFull token = AuthHelper.verifyToken(request);
			if(!user.isme(token))
				Validator.unauthorized(token, new Role[] {Role.ADMIN});
			String oldPwdHash = DigestUtils.sha512Hex(input.getOldpassword());
			if (!oldPwdHash.equals(user.getPassword())) 
				ErrorException.trow(9941);
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
	public Response showAuthsessions(TokenRequest request){
		try{
			TokenFull token = AuthHelper.verifyToken(request);
			Validator.unauthorized(token, new Role[] {Role.ADMIN});
			return buildresponse(Map.of("tokens", getAllSessions()));

		} catch (Exception e){
			return Error.fromexception(e);
		}
	}	

	@POST
	@Path("/endfriend")
	@Produces(MediaType.APPLICATION_JSON)
	public Response endFriend() throws ErrorException{
		QueryResults<Entity> sessions = datastore.run(Query.newEntityQueryBuilder().setKind("Friend").build());
		AuthHelper.querydelete("ForumPost","type","FRIEND");
		while(sessions.hasNext())
			datastore.delete(sessions.next().getKey());
		return buildresponse(Map.of("message", "ALL UNFRIEND"));
	}

	@POST
	@Path("/addfriend")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response addFriend(ShortUserTokenRequest request) throws ErrorException{
		Transaction txn = datastore.newTransaction();
		try{
			TokenFull token = AuthHelper.verifyToken(request);
			UserFull user = AuthHelper.getUser(request.getInput());
			Key friendKey = FriendFull.getFriendKey(token,user);
			Entity existingfriend = txn.get(friendKey);

			if (existingfriend == null) {
				FriendFull friend=FriendFull.newfriends(token,user);
				txn.put(friend.toentity());
				txn.commit();
				return buildresponse(Map.of("message", "Friend Request Sent"));
			}
			else {
				FriendFull friend=FriendFull.fromdatabase(existingfriend);
				if(friend.getAccepted()) 
					ErrorException.trow(9926);
				else {
					if(friend.getUsername1().equals(token.getUsername()))
						ErrorException.trow(9927);
					else {
						friend.acceptrecquest();
						datastore.put(friend.toentity());
					}
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
			TokenFull token = AuthHelper.verifyToken(request);
			UserFull user = AuthHelper.getUser(request.getInput());
			FriendFull existingfriend = FriendFull.fromdatabase(datastore.get(FriendFull.getFriendKey(token,user)));
			if(existingfriend == null || !existingfriend.getAccepted())
				ErrorException.trow(9934);
			if(existingfriend.getUsername1().equals(user.getUsername()))
				existingfriend.setNickname1(request.getInput().getNewName());
			else
				existingfriend.setNickname2(request.getInput().getNewName());
			datastore.put(existingfriend.toentity());
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
			UserFull user = AuthHelper.getUser(request.getInput());
			TokenFull token = AuthHelper.verifyToken(request);
			FriendFull friend = FriendFull.fromdatabase(token, user);
			if(friend==null)
				ErrorException.trow(9934);
			datastore.delete(friend.getKey());
			String str= friend.formatkey();
			AuthHelper.querydelete("ForumPost","friend_id",str);
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
		try{
			String username=AuthHelper.getUser(request.getInput()).getUsername();
			AuthHelper.verifyToken(request);
			List<Map<String, Object>> friends = new LinkedList<>();
			EntityQuery.Builder queryBuilder = Query.newEntityQueryBuilder().setKind("Friend");
			queryBuilder.setFilter(PropertyFilter.eq("accepted", true));
			QueryResults<Entity> sessions = datastore.run(queryBuilder.build());
			while(sessions.hasNext())
				friends.add(FriendFull.fromdatabase(sessions.next()).otherfriend(username));
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
			TokenFull token = AuthHelper.verifyToken(request);
			List<Map<String, Object>> friends = new LinkedList<>();
			EntityQuery.Builder queryBuilder = Query.newEntityQueryBuilder().setKind("Friend");
			queryBuilder.setFilter(CompositeFilter.and(
					PropertyFilter.eq("accepted", false),
					PropertyFilter.eq("username_2", token.getUsername())));
			QueryResults<Entity> sessions = datastore.run(queryBuilder.build());
			while(sessions.hasNext()) 
				friends.add(FriendFull.fromdatabase(sessions.next()).cesiving());
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
			TokenFull token=TokenFull.fromdatabase(session);
			if(token.isexpierd())
				datastore.delete(session.getKey());
			else
				tokensOutput.add(token.tomap());
		}
		return tokensOutput;

	}

	private void becomeloner(String name) {
		QueryResults<Entity> results = datastore.run(Query.newEntityQueryBuilder()
				.setKind("Friend")
				.setFilter(PropertyFilter.eq("username_1", name))
				.build());
		while (results.hasNext()) {
			FriendFull friend = FriendFull.fromdatabase(results.next());
			AuthHelper.querydelete("ForumPost","friend_id",friend.formatkey());
			datastore.delete(friend.getKey());
		}
		results = datastore.run(Query.newEntityQueryBuilder()
				.setKind("Friend")
				.setFilter(PropertyFilter.eq("username_2", name))
				.build());
		while (results.hasNext()) {
			FriendFull friend = FriendFull.fromdatabase(results.next());
			AuthHelper.querydelete("ForumPost","friend_id",friend.formatkey());
			datastore.delete(friend.getKey());
		}
	}

	public static void unattendevents(String username){
		QueryResults<Entity> entitys = datastore.run(Query.newEntityQueryBuilder()
				.setKind("Attendance")
				.setFilter(PropertyFilter.eq("username", username))
				.build());
		while(entitys.hasNext()) {
			AttendanceFull attendace = AttendanceFull.fromdatabase(entitys.next());
			EventFull event = EventFull.fromdatabase(attendace.getEvent());
			event.decAttendee();
			datastore.put(event.toentity());
			datastore.delete(attendace.getKey());
		}
	}

	private static Response buildresponse(Map<String,Object> map) {
		return ResponceBuilder.constructorsuccess(map);
	}

}