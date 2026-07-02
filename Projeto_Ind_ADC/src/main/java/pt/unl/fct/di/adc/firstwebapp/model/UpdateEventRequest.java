package pt.unl.fct.di.adc.firstwebapp.model;

import pt.unl.fct.di.adc.firstwebapp.Objects.EventAtributsid;

public class UpdateEventRequest extends AbstractTokenInputRequest<EventAtributsid>implements ModelInterface{
	
	/**
	 * {
	 *   "token": { "tokenId": "<jwt>" },
	 *   "input": {
	 *   	"eventId": "...",
	 *   	"title": "...",           (optional — only fields present are updated)
	 *   	"description": "...",
	 *   	"category": "MUSIC",
	 *   	"location": "...",
	 *   	"startDate": 1234567890,
	 *   	"durationMinutes": 120,
	 *   	"maxAttendees": 100,
	 *   	"coverImageUrl":"https://..."
	 *   	"isPublic": true}
	 * }
	 */
	
	public UpdateEventRequest() {};

}
