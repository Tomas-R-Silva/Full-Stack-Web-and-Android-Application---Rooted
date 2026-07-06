package pt.unl.fct.di.adc.firstwebapp.model;

import pt.unl.fct.di.adc.firstwebapp.Objects.EventAtributs;

public class CreateEventRequest extends AbstractTokenInputRequest<EventAtributs>{
	
	/**
	 * {
	 *   "token": { "jwt": "<jwt>" },
	 *   "input":{
	 *   	"title": "...",
	 *   	"description": "...",
	 *   	"category": "MUSIC",
	 *   	"location": "...",
	 *   	"startDate": 1234567890,
	 *   	"durationMinutes": 120,
	 *   	"maxAttendees": 100,
	 *   	"minAttendees": 10,
	 *   	"isPublic": true,
	 *   	"isAccessible": true,
	 *   	"SDG": [1,14,3]
	 *    }
	 * }
	 */
	
	public CreateEventRequest() {}

}
