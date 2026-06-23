package pt.unl.fct.di.adc.firstwebapp.Objects;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import pt.unl.fct.di.adc.firstwebapp.error.Error;
import pt.unl.fct.di.adc.firstwebapp.error.ErrorException;

public class ForumPost {

	public static final int MAX_TEXT_LENGTH = 1000;

	private String postId;
	private String eventId;
	private String authorUsername;
	private String text;
	private long createdAt;        
	private String parentPostId;   // null = top-level post, otherwise the post it replies to

	public ForumPost() {}

	public void isValid() throws ErrorException {
		List<Map<String,Object>> list = new LinkedList<>();
		if (!validVariable(text) || text.length() > MAX_TEXT_LENGTH)
			list.add(Error.createmap(9930));
		if (!validVariable(eventId))
			list.add(Error.createmap(9906));
		if (!list.isEmpty())
			Error.invalid_input(list);
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
}
