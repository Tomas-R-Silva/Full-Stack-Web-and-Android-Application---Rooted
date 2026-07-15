package pt.unl.fct.di.adc.firstwebapp.model;

import pt.unl.fct.di.adc.firstwebapp.Objects.EventInputInterface;
import pt.unl.fct.di.adc.firstwebapp.Objects.ShortUser;

/**
 * POST /rest/events/respondjoin — the organizer accepts or rejects a join request.
 *
 * {
 *   "token": { "jwt": "<jwt>" },
 *   "input": {
 *       "eventId":  "...",     // the private event
 *       "username": "...",     // the requester being answered
 *       "accept":   true        // true = accept, false = reject
 *   }
 * }
 */
public class RespondJoinRequest extends AbstractTokenInputRequest<RespondJoinRequest.RespondJoinInput>{

    public RespondJoinRequest() {}

    public static class RespondJoinInput extends ShortUser implements EventInputInterface{
        private String eventId;
        private boolean accept;

        public RespondJoinInput() {}
        @Override
        public String getEventId() { return eventId; }
        @Override
        public void setEventId(String eventId) { this.eventId = eventId; }

        public boolean isAccept() { return accept; }
        public void setAccept(boolean accept) { this.accept = accept; }
    }
}
