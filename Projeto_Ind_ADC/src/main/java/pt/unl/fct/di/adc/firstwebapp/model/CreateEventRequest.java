package pt.unl.fct.di.adc.firstwebapp.model;

/**
 * {
 *   "token": { "tokenId": "<jwt>" },
 *   "title": "...",
 *   "description": "...",
 *   "category": "MUSIC",
 *   "location": "...",
 *   "startDate": 1234567890,
 *   "durationMinutes": 120,
 *   "maxAttendees": 100,
 *   "minAttendees": 10,
 *   "isPublic": true
 * }
 */
public class CreateEventRequest extends TokenRequest{

    private String title;
    private String description;
    private String category;
    private String location;
    private long startDate;
    private long durationMinutes;
    private Integer maxAttendees;
    private Integer minAttendees;
    private boolean isPublic;

    public CreateEventRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public long getStartDate() { return startDate; }
    public void setStartDate(long startDate) { this.startDate = startDate; }

    public long getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(long durationMinutes) { this.durationMinutes = durationMinutes; }

    public Integer getMaxAttendees() { return maxAttendees; }
    public void setMaxAttendees(int maxAttendees) { this.maxAttendees = maxAttendees; }

    public Integer getMinAttendees() { return minAttendees; }
    public void setMinAttendees(int minAttendees) { this.minAttendees = minAttendees; }
    
    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }
}
