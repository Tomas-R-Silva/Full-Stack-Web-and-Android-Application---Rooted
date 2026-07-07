package pt.unl.fct.di.adc.firstwebapp.Objects;

import java.util.Map;

import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.Key;

import pt.unl.fct.di.adc.firstwebapp.error.ErrorException;

public class FriendFull implements Full{

	private String username1;
	private String username2;
	private String nickname1;
	private String nickname2;
	private boolean accepted;
	private long start;
	private Key key;
	public FriendFull() {}

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

	public static FriendFull fromdatabase(Entity entity) {
		// TODO Auto-generated method stub
		return null;
	}

	public static FriendFull newfriends(TokenFull token,UserFull user) {
		FriendFull friends = new FriendFull();
		friends.setUsername1(token.getUsername());
		friends.setUsername1(user.getUsername());
		friends.setAccepted(false);
		friends.setNickname1(null);
		friends.setNickname2(null);
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
	
	@Override
	public Key getKey() {return key;}
	@Override
	public void setKey(Key key) {this.key=key;}
	@Override
	public Entity toentity(Key key) {this.setKey(key);return toentity();}
	@Override
	public Map<String, Object> tomap(Entity e) {return fromdatabase(e).tomap();}
}
