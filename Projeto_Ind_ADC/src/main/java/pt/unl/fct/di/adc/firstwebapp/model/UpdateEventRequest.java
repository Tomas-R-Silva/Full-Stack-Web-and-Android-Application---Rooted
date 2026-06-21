package pt.unl.fct.di.adc.firstwebapp.model;

/**
 * {
 *   "token": { "tokenId": "<jwt>" },
 *   "eventId": "...",
 *   "title": "...",           (optional — only fields present are updated)
 *   "description": "...",
 *   "category": "MUSIC",
 *   "location": "...",
 *   "startDate": 1234567890,
 *   "durationMinutes": 120,
 *   "maxAttendees": 100,
 *   "isPublic": true,
 *   "coverImageUrl": "..."
 * }
 */
public class UpdateEventRequest extends AbstractTokenRequest{

    private String eventId;
    private String title;
    private String description;
    private String category;
    private String location;
    private Long startDate;
    private Long durationMinutes;
    private Integer maxAttendees;
    private Boolean isPublic;
    private String coverImageUrl;

    public UpdateEventRequest() {}

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Long getStartDate() { return startDate; }
    public void setStartDate(Long startDate) { this.startDate = startDate; }

    public Long getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Long durationMinutes) { this.durationMinutes = durationMinutes; }

    public Integer getMaxAttendees() { return maxAttendees; }
    public void setMaxAttendees(Integer maxAttendees) { this.maxAttendees = maxAttendees; }

    public Boolean getIsPublic() { return isPublic; }
    public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }

    public String getCoverImageUrl() { return coverImageUrl; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }
}
