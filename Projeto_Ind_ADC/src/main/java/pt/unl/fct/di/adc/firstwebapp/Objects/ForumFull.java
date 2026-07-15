package pt.unl.fct.di.adc.firstwebapp.Objects;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.Key;
import pt.unl.fct.di.adc.firstwebapp.error.Error;
import pt.unl.fct.di.adc.firstwebapp.error.ErrorException;
import pt.unl.fct.di.adc.firstwebapp.model.PostMessageRequest;

public class ForumFull implements Full,EventInputInterface{

	public static final int MAX_TEXT_LENGTH = 1000;
	private final Key key;
	private ForumType type;
	private String postId;
	private String friendId;
	private String eventId;
	private String authorUsername;
	private String text;
	private long createdAt;        
	private String parentPostId;   // null = top-level post, otherwise the post it replies to

	public enum ForumType{
		EVENT,FRIEND;		
		public static ForumType valueof(String v) {try{return ForumType.valueOf(v);}catch (Exception e) {return null;}}
	}

	private ForumFull(Key key) {this.key=key;}

	public void isValid() throws ErrorException {
		List<Map<String,Object>> list = new LinkedList<>();
		if (!validVariable(text) || text.length() > MAX_TEXT_LENGTH)
			list.add(Error.createmap(9930));
		if (!(validVariable(eventId)&&type.equals(ForumType.EVENT)))
			list.add(Error.createmap(9937));
		if (!(validVariable(postId)&&type.equals(ForumType.FRIEND)))
			list.add(Error.createmap(9937));
		if (!list.isEmpty())
			Error.invalid_input(list);
	}

	public static ForumFull fromdatabase(Entity entity) {
		if(entity==null)return null;
		ForumFull post = new ForumFull(entity.getKey());
		post.setPostId(Full.getString(entity, "post_id"));
		post.setEventId(Full.getString(entity, "event_id"));

		post.setEventId(Full.getString(entity, "type"));
		post.setEventId(Full.getString(entity, "friend_id"));

		post.setAuthorUsername(Full.getString(entity, "author_username"));
		post.setText(Full.getString(entity, "text"));
		post.setParentPostId(Full.getString(entity, "parentPostId"));
		post.setCreatedAt(Full.getLong(entity, "created_at"));
		return post;
	}

	public static ForumFull newforumevent(Datastore datastore, EventFull event,TokenFull token,PostMessageRequest.PostMessageinput input) throws ErrorException {
		if(event==null)
			ErrorException.trow(9937);
		ForumFull post = ForumFull.newforum(datastore,token,input);
		post.setType(ForumType.EVENT);
		post.setEventId(event.getEventId());
		post.isValid();
		return post;
	}

	private static ForumFull newforum(Datastore datastore,TokenFull token,PostMessageRequest.PostMessageinput input) throws ErrorException {
		String ID;
		Key key;
		do {
			ID=UUID.randomUUID().toString();
			key=datastore.newKeyFactory().setKind("ForumPost").newKey(ID);
		}while(datastore.get(key)!=null);
		ForumFull post = new ForumFull(key);
		post.setPostId(ID);
		post.setAuthorUsername(token.getUsername());
		post.setText(input.getText());
		post.setParentPostId(input.getParentPostId());
		post.setCreatedAt(System.currentTimeMillis());
		post.isValid();
		return post;
	}

	public static ForumFull newforumfriend(Datastore datastore, FriendFull friend,TokenFull token,PostMessageRequest.PostMessageinput input) throws ErrorException {
		if(friend==null||!friend.getAccepted())
			ErrorException.trow(9937);
		ForumFull post = ForumFull.newforum(datastore,token,input);
		post.setType(ForumType.FRIEND);
		post.setFriendId(friend.formatkey());	
		post.isValid();
		return post;
	}

	public static boolean validVariable(String var) {
		return var != null && !var.isBlank();
	}

	public String getPostId() { return postId; }
	public void setPostId(String postId) { this.postId = postId; }
	public String getEventId() { return eventId; }
	public void setEventId(String eventId) { this.eventId = eventId; }
	public String getFriendId() {return friendId;}
	public void setFriendId(String friendId) { this.friendId = friendId; }
	public String getAuthorUsername() { return authorUsername; }
	public void setAuthorUsername(String authorUsername) { this.authorUsername = authorUsername; }
	public String getText() { return text; }
	public void setText(String text) { this.text = text; }
	public long getCreatedAt() { return createdAt; }
	public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
	public String getParentPostId() { return parentPostId; }
	public void setParentPostId(String parentPostId) { this.parentPostId = parentPostId; }
	public String getType() { return type.name(); }
	private void setType(ForumType type) { this.type = type; }
	public boolean isType(ForumType type) { return this.type.equals(type); }
	@Override
	public Map<String, Object> tomap() {
		Map<String, Object> map = new HashMap<>();
		map.put("postId", Full.string(this.postId));
		map.put("type", Full.string(this.type.name()));
		map.put("authorUsername", Full.string(this.authorUsername));
		map.put("text", Full.string(this.text));
		map.put("createdAt", this.createdAt);
		map.put("parentPostId", Full.string(this.parentPostId));
		map.put("eventId", Full.string(this.eventId));
		map.put("friendId", Full.string(this.friendId));
		return map;
	}

	@Override
	public Map<String, Object> tomap(Entity e) {return fromdatabase(e).tomap();}

	@Override
	public Key getKey() {return key;}

	@Override
	public Entity toentity() {
		Entity.Builder entity= Entity.newBuilder(key)
				.set("post_id", this.getPostId())
				.set("type", this.type.name())
				.set("author_username", this.getAuthorUsername())
				.set("text", this.getText())
				.set("created_at", this.getCreatedAt()/TIME_DIVIDER)
				.set("parent_post_id", this.getParentPostId());
		if(type.equals(ForumType.EVENT)) 
			entity.set("event_id", this.getEventId());
		else if(type.equals(ForumType.FRIEND)) 
			entity.set("friend_id", this.getFriendId());
		return entity.build();
	}


}
