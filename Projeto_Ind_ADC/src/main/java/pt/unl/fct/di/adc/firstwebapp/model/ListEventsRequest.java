package pt.unl.fct.di.adc.firstwebapp.model;

/**
 * {
 *   "token": { "tokenId": "<jwt>" },  (optional — required only to see private events)
 *   "category": "MUSIC",              (optional filter)
 *   "status": "UPCOMING",             (optional filter, defaults to UPCOMING)
 *   "organizerUsername": "...",        (optional filter)
 *   "pageSize": 20,                   (optional, default 20)
 *   "cursor": "..."                   (optional, for pagination)
 * }
 */
public class ListEventsRequest  extends TokenRequest{

    private String category;
    private String status;
    private String organizerUsername;
    private int pageSize;
    private String cursor;

    public ListEventsRequest() {
        this.pageSize = 20;
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getOrganizerUsername() { return organizerUsername; }
    public void setOrganizerUsername(String organizerUsername) { this.organizerUsername = organizerUsername; }

    public int getPageSize() { return pageSize <= 0 ? 20 : pageSize; }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; }

    public String getCursor() { return cursor; }
    public void setCursor(String cursor) { this.cursor = cursor; }
}
