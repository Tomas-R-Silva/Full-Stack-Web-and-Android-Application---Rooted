package pt.unl.fct.di.adc.firstwebapp.model;

public class DeleteImageRequest {

    private Token token;
    private String eventId;
    private String imageUrl;

    public DeleteImageRequest() {}

    public Token getToken() { return token; }
    public void setToken(Token token) { this.token = token; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
