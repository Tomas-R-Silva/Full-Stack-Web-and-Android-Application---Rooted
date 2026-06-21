package pt.unl.fct.di.adc.firstwebapp.model;

import java.util.Collections;
import java.util.List;

public class UploadImageRequest extends AbstractTokenRequest{

    private String eventId;
    // Each string is a Base64 data URL: "data:image/jpeg;base64,/9j/4AAQ..."
    private List<String> images;

    public UploadImageRequest() {}

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public List<String> getImages() { return images != null ? images : Collections.emptyList(); }
    public void setImages(List<String> images) { this.images = images; }
}
