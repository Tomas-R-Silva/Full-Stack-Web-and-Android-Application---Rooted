package pt.unl.fct.di.adc.firstwebapp.Objects;

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



	private static final long TIME_DIVIDER = 1000L;
	public static final int MAX_TEXT_LENGTH = 1000;
	private final Key key;
	//private ForumType type;
	private String postId;
	//private String friendId;
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
		if (!validVariable(eventId))
			list.add(Error.createmap(9906));
		if (!list.isEmpty())
			Error.invalid_input(list);
	}

	public static ForumFull fromdatabase(Entity entity) {
		if(entity==null)return null;
		ForumFull post = new ForumFull(entity.getKey());
		post.setPostId(Full.getString(entity, "postId"));
		post.setEventId(Full.getString(entity, "eventId"));
		post.setAuthorUsername(Full.getString(entity, "authorUsername"));
		post.setText(Full.getString(entity, "text"));
		post.setParentPostId(Full.getString(entity, "parentPostId"));
		post.setCreatedAt(Full.getLong(entity, "createdAt"));
		return post;
	}

	public static ForumFull newforum(Datastore datastore, EventFull event,TokenFull token,PostMessageRequest.PostMessageinput input) throws ErrorException {
		String ID=UUID.randomUUID().toString();
		ForumFull post = new ForumFull(datastore.newKeyFactory().setKind("ForumPost").newKey(ID));
		post.setPostId(ID);
		post.setEventId(event.getEventId());
		post.setAuthorUsername(token.getUsername());
		post.setText(input.getText());
		post.setParentPostId(input.getParentPostId());
		post.setCreatedAt(System.currentTimeMillis());
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

	public String getAuthorUsername() { return authorUsername; }
	public void setAuthorUsername(String authorUsername) { this.authorUsername = authorUsername; }

	public String getText() { return text; }
	public void setText(String text) { this.text = text; }

	public long getCreatedAt() { return createdAt; }
	public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }

	public String getParentPostId() { return parentPostId; }
	public void setParentPostId(String parentPostId) { this.parentPostId = parentPostId; }

	@Override
	public Map<String, Object> tomap() {
		Map<String, Object> map = Map.of("postId", Full.string(this.postId),
				//"type",Full.string(this.type.name()),
				"authorUsername", Full.string(this.authorUsername),
				"text", Full.string(this.text),
				"createdAt", this.createdAt,
				"parentPostId", Full.string(this.parentPostId));
		//if(this.type.equals(ForumType.EVENT)) 
			map.put("eventId", Full.string(this.eventId));
		//else if(this.type.equals(ForumType.FRIEND)) 
		//	map.put("friendId", Full.string(this.friendId));
		return map;
	}

	@Override
	public Map<String, Object> tomap(Entity e) {return fromdatabase(e).tomap();}

	@Override
	public Key getKey() {return key;}

	@Override
	public Entity toentity() {
		return Entity.newBuilder(key)
				.set("post_id", this.getPostId())
				//.set("friend", this.friendId)
				.set("event_id", this.getEventId())
				//.set("type", this.type)
				.set("author_username", this.getAuthorUsername())
				.set("text", this.getText())
				.set("created_at", this.getCreatedAt()/TIME_DIVIDER)
				.set("parent_post_id", this.getParentPostId())
				.build();
	}
}
