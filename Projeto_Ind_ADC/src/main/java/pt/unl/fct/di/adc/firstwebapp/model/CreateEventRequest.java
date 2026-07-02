package pt.unl.fct.di.adc.firstwebapp.model;

import pt.unl.fct.di.adc.firstwebapp.Objects.EventAtributs;

public class CreateEventRequest extends AbstractTokenInputRequest<EventAtributs>implements ModelInterface{
	
	/**
	 * {
	 *   "token": { "tokenId": "<jwt>" },
	 *   "input":{
	 *   	"title": "...",
	 *   	"description": "...",
	 *   	"category": "MUSIC",
	 *   	"location": "...",
	 *   	"startDate": 1234567890,
	 *   	"durationMinutes": 120,
	 *   	"maxAttendees": 100,
	 *   	"minAttendees": 10,
	 *   	"isPublic": true }
	 * }
	 */
	
	public CreateEventRequest() {}

	@SuppressWarnings("unchecked")
	@Override
	public Class<EventAtributs> Getinputclass() {
		return EventAtributs.class;
	}
}
