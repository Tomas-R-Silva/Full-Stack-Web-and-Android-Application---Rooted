package pt.unl.fct.di.adc.firstwebapp.model;

import pt.unl.fct.di.adc.firstwebapp.Objects.EventInput;

public class EventTokenRequest extends AbstractTokenInputRequest<EventInput>{

	/**
	 * {
	 *   "token": { "jwt": "<jwt>" },
	 *   "input": { "eventId": "..." }
	 * }
	 */
	
	public EventTokenRequest() {}

}