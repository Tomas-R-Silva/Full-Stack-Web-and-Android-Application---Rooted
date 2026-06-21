package pt.unl.fct.di.adc.firstwebapp.model;

/**
 * {
 *   "token": { "jwt": "<jwt>" },
 *   "eventId": "...",
 *   "cursor": "...",     (optional, from a previous response's nextCursor)
 *   "pageSize": 50       (optional, default 50, max 100)
 * }
 */
public class ListForumRequest {

	private Token token;
	private String eventId;
	private String cursor;
	private int pageSize;

	public ListForumRequest() {}

	public Token getToken() { return token; }
	public void setToken(Token token) { this.token = token; }

	public String getEventId() { return eventId; }
	public void setEventId(String eventId) { this.eventId = eventId; }

	public String getCursor() { return cursor; }
	public void setCursor(String cursor) { this.cursor = cursor; }

	public int getPageSize() { return pageSize; }
	public void setPageSize(int pageSize) { this.pageSize = pageSize; }
}
