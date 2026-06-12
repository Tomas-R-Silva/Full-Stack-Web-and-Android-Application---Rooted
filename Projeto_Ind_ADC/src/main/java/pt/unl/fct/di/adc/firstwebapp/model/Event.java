package pt.unl.fct.di.adc.firstwebapp.model;

public class Event {

    public enum Category {
        MUSIC, SPORTS, TECH, ART, FOOD, BUSINESS, COMMUNITY, OTHER
    }

    public enum Status {
        UPCOMING, ONGOING, CANCELLED, COMPLETED
    }

    private String eventId;
    private String title;
    private String description;
    private Category category;
    private String location;
    private long startDate;       // epoch seconds
    private long durationMinutes; // how long the event lasts
    private String organizerUsername;
    private int maxAttendees;     // 0 = unlimited
    private boolean isPublic;
    private Status status;
    private long createdAt;       // epoch seconds
    private String coverImageUrl; // GCS url, stored after image upload

    public Event() {}

    public boolean isValid() {
        return title != null && !title.isBlank()
                && description != null && !description.isBlank()
                && category != null
                && location != null && !location.isBlank()
                && startDate > 0
                && durationMinutes > 0
                && organizerUsername != null && !organizerUsername.isBlank();
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public long getStartDate() { return startDate; }
    public void setStartDate(long startDate) { this.startDate = startDate; }

    public long getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(long durationMinutes) { this.durationMinutes = durationMinutes; }

    public String getOrganizerUsername() { return organizerUsername; }
    public void setOrganizerUsername(String organizerUsername) { this.organizerUsername = organizerUsername; }

    public int getMaxAttendees() { return maxAttendees; }
    public void setMaxAttendees(int maxAttendees) { this.maxAttendees = maxAttendees; }

    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public long getCreatedAt() { return createdAt; }
    public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }

    public String getCoverImageUrl() { return coverImageUrl; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }
}
