package pt.unl.fct.di.adc.firstwebapp.model;

public class DeleteImageRequest extends TokenRequest{


    private String eventId;
    private String imageUrl;

    public DeleteImageRequest() {}

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
