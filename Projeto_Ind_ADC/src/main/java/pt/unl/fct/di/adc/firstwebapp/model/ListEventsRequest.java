package pt.unl.fct.di.adc.firstwebapp.model;


public class ListEventsRequest extends AbstractTokenInputRequest<ListEventsRequest.ListEventsInput>{

	/**
	 * {
	 *   "token": { "tokenId": "<jwt>" },  (optional — required only to see private events)
	 *   "input": {
	 *   	"category": "MUSIC",              (optional filter)
	 *   	"status": "UPCOMING",             (optional filter, defaults to UPCOMING)
	 *   	"organizerUsername": "...",        (optional filter)
	 *   	"pageSize": 20,                   (optional, default 20)
	 *   	"cursor": "..."                   (optional, for pagination)
	 *   }

	 * }
	 */
	
	public ListEventsRequest() {}
	
	public class ListEventsInput{
		private String category;
	    private String status;
	    private String organizerUsername;
	    private Integer pageSize;
	    private String cursor;

	    public ListEventsInput() {}

	    public String getCategory() { return category; }
	    public void setCategory(String category) { this.category = category; }

	    public String getStatus() { return status; }
	    public void setStatus(String status) { this.status = status; }

	    public String getOrganizerUsername() { return organizerUsername; }
	    public void setOrganizerUsername(String organizerUsername) { this.organizerUsername = organizerUsername; }

	    
	    public int getPageSize() { return (pageSize==null||pageSize <= 0) ? 20 : pageSize; }
	    public void setPageSize(int pageSize) { this.pageSize = pageSize; }

	    public String getCursor() { return cursor; }
	    public void setCursor(String cursor) { this.cursor = cursor; }
	}
    
}
