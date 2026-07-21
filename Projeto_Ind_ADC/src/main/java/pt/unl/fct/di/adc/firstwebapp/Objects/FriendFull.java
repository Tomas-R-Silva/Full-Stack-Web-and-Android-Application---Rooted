package pt.unl.fct.di.adc.firstwebapp.Objects;

import java.util.Map;

import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.Key;

import pt.unl.fct.di.adc.firstwebapp.Utilities.AuthHelper;
import pt.unl.fct.di.adc.firstwebapp.error.ErrorException;

public class FriendFull implements Full{
	private static final Datastore datastore = DatastoreOptions.newBuilder().setProjectId(AuthHelper.PROJECT_ID).build().getService();

	private String username1;
	private String username2;
	private String nickname1;
	private String nickname2;
	private boolean accepted;
	private long start;
	private final Key key;
	public FriendFull(Key key) {this.key=key;}
	public String getUsername1(){return username1;}
	public void setUsername1(String username1){this.username1 = username1;}
	public String getUsername2(){return username2;}
	public void setUsername2(String username2){this.username2 = username2;}
	public String getNickname1(){return nickname1;}
	public void setNickname1(String nickname1){this.nickname1 = nickname1;}
	public String getNickname2(){return nickname2;}
	public void setNickname2(String nickname2){this.nickname2 = nickname2;}
	public long getStart(){return start;}
	public void setStart(long start){this.start = start;}
	public boolean getAccepted(){return accepted;}
	public void setAccepted(boolean accepted){this.accepted = accepted;}

	public static FriendFull fromdatabase(TokenFull token,UserFull user) throws ErrorException {
		return fromdatabase(datastore.get(getFriendKey(token,user)));
	}
	public static FriendFull fromdatabase(Entity entity) {
		if(entity==null)return null;
		FriendFull friend=new FriendFull(entity.getKey());
		friend.setUsername1(Full.getString(entity, "username_1"));
		friend.setUsername2(Full.getString(entity, "username_2"));
		friend.setNickname1(Full.getString(entity, "nickname_1"));
		friend.setNickname2(Full.getString(entity, "nickname_2"));
		friend.setAccepted(Full.getBoolean(entity, "accepted"));
		friend.setStart(Full.getLong(entity, "issued_at")*TIME_DIVIDER);
		return friend;
	}
	
	public String getnickname(UserFull user){
		String ke=(getUsername1().equals(user.getUsername()))?ke=getNickname1():getNickname2();
		return ke.isBlank()?user.getDisplay():ke;
	}

	public static FriendFull newfriends(TokenFull token,UserFull user) throws ErrorException {
		FriendFull friends = new FriendFull(getFriendKey(token,user));
		friends.setUsername1(token.getUsername());
		friends.setUsername2(user.getUsername());
		friends.setAccepted(false);
		friends.setNickname1("");
		friends.setNickname2("");
		friends.setStart(System.currentTimeMillis());
		return friends;
	}

	public void acceptrecquest() throws ErrorException {
		if(accepted)
			ErrorException.trow(9926);
		setAccepted(true);
		setStart(System.currentTimeMillis());
	}

	@Override
	public Map<String, Object> tomap() {
		return Map.of("username_1", username1,
				"username_2", username2,
				"nickname_1", nickname1,
				"nickname_2", nickname2,
				"accepted", accepted,
				"issued_at", start);
	}
	
	public Map<String, Object> otherfriend(String me) {
		final String friend="Friend",starts="Start";	
		if(username1.equals(me))
			return Map.of(friend, username2,starts, start);
		else
			return Map.of(friend, username1,starts, start);

	}
	
	public Map<String, Object> cesiving() {
		return Map.of("From", username1,"Sent at", start);
	}

	@Override
	public Entity toentity() {
		return Entity.newBuilder(key)
				.set("username_1", username1)
				.set("username_2", username2)
				.set("nickname_1", nickname1)
				.set("nickname_2", nickname2)
				.set("accepted", accepted)
				.set("issued_at", start/TIME_DIVIDER)
				.build();
	}

	public static String formatkey(TokenFull token,UserFull user) throws ErrorException {
		int compare=user.getUsername().compareTo(token.getUsername());
		if(compare==0)
			ErrorException.trow(9925);
		String f1,f2;
		if((compare>0)) {
			f1=user.getUsername();
			f2=token.getUsername();
		}else{
			f2=user.getUsername();
			f1=token.getUsername();
		}
		return String.format("%s@@@%s", f1,f2);
	}
	
	public String formatkey() throws ErrorException {
		int compare=this.username1.compareTo(this.username2);
		if(compare==0)
			ErrorException.trow(9925);
		String f1,f2;
		if((compare>0)) {
			f1=this.username1;
			f2=this.username2;
		}else{
			f2=this.username1;
			f1=this.username2;
		}
		return String.format("%s@@@%s", f1,f2);
	}
	
	public static Key getFriendKey(TokenFull token,UserFull user) throws ErrorException{
		return datastore.newKeyFactory().setKind("Friend").newKey(FriendFull.formatkey(token,user));
	}
	
	@Override
	public Key getKey() {return key;}
	@Override
	public Map<String, Object> tomap(Entity e) {return fromdatabase(e).tomap();}
}
