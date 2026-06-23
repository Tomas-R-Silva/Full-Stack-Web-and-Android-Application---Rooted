package pt.unl.fct.di.adc.firstwebapp.model;

/**
 * {
 *   "token": { "jwt": "<jwt>" },
 *   "eventId": "...",
 *   "text": "...",
 *   "parentPostId": "..."   (optional, for replies)
 * }
 */
public class PostMessageRequest extends TokenRequest{

	private String eventId;
	private String text;
	private String parentPostId;

	public PostMessageRequest() {}
	
	public String getEventId() { return eventId; }
	public void setEventId(String eventId) { this.eventId = eventId; }

	public String getText() { return text; }
	public void setText(String text) { this.text = text; }

	public String getParentPostId() { return parentPostId; }
	public void setParentPostId(String parentPostId) { this.parentPostId = parentPostId; }
}
