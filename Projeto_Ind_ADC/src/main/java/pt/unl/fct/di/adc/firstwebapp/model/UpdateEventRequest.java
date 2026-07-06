package pt.unl.fct.di.adc.firstwebapp.model;

import pt.unl.fct.di.adc.firstwebapp.Objects.EventAtributsid;

public class UpdateEventRequest extends AbstractTokenInputRequest<EventAtributsid>{
	
	/**
	 * {
	 *   "token": { "jwt": "<jwt>" },
	 *   "input": {
	 *   	"eventId": "...",
	 *   	"title": "...",           (optional — only fields present are updated)
	 *   	"description": "...",
	 *   	"category": "MUSIC",
	 *   	"location": "...",
	 *   	"startDate": 1234567890,
	 *   	"durationMinutes": 120,
	 *   	"maxAttendees": 100,
	 *   	"isPublic": true,
	 *   	"isAccessible": true,
	 *   	"SDG": [1,14,3]}
	 * }
	 */
	
	public UpdateEventRequest() {};

}
