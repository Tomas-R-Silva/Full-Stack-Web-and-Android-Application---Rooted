package pt.unl.fct.di.adc.firstwebapp.model;

import java.util.Map;

import pt.unl.fct.di.adc.firstwebapp.Objects.EventInputInterface;
import pt.unl.fct.di.adc.firstwebapp.Objects.ShortUser;

public class EventShortUserTokenRequest extends AbstractTokenInputRequest<EventShortUserTokenRequest.EventShortUser>implements ModelInterface,TokenRequestInterface{

	/**
	 * {
	 *   "token": { "tokenId": "<jwt>" },
	 *   "input": { 
	 *   	"eventId": "...",
	 *   	"username": "..." }
	 * }
	 */

	public EventShortUserTokenRequest(){}


	public class EventShortUser extends ShortUser implements ModelInterface,EventInputInterface{
		private String eventId;

		public EventShortUser() {}

		public String getEventId() { return eventId; }
		public void setEventId(String eventId) { this.eventId = eventId; }

		@Override
		public Map<String, Object> getformat() {
			Map<String, Object> map=super.getformat();
			map.put("eventId", ModelInterface.defaultstr);
			return map;
		}
	}


	@SuppressWarnings("unchecked")
	@Override
	public Class<EventShortUser> Getinputclass() {
		return EventShortUser.class;
	}
}


