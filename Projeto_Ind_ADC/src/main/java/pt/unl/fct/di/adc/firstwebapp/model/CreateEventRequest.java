package pt.unl.fct.di.adc.firstwebapp.model;

import pt.unl.fct.di.adc.firstwebapp.Objects.EventAtributs;

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
public class CreateEventRequest extends AbstractTokenInputRequest<EventAtributs>{
	
	public CreateEventRequest() {}		
}
