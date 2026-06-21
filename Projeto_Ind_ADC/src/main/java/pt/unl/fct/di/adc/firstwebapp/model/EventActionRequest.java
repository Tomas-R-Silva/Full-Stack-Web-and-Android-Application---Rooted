package pt.unl.fct.di.adc.firstwebapp.model;

/**
 * Generic request for event operations that need only an eventId.
 * Used by: get, delete, attend, unattend, cancel, attendees.
 *
 * {
 *   "token": { "tokenId": "<jwt>" },  (token is optional for public get)
 *   "eventId": "..."
 * }
 */
public class EventActionRequest  extends AbstractTokenRequest{

    private String eventId;

    public EventActionRequest() {}

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
}
