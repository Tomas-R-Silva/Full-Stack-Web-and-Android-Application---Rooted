package pt.unl.fct.di.adc.firstwebapp.model;

import pt.unl.fct.di.adc.firstwebapp.Objects.ShortUser;

public class EventShortUserTokenRequest extends AbstractTokenInputRequest<EventShortUserTokenRequest.EventShortUser>implements TokenRequestInterface{

	/**
	 * {
	 *   "token": { "jwt": "<jwt>" },
	 *   "input": { 
	 *   	"eventId": "...",
	 *   	"username": "..." }
	 * }
	 */

	public EventShortUserTokenRequest(){}


	public class EventShortUser extends ShortUser{
		private String eventId;

		public EventShortUser() {}

		public String getEventId() { return eventId; }
		public void setEventId(String eventId) { this.eventId = eventId; }
	}
}

