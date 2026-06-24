package pt.unl.fct.di.adc.firstwebapp.model;

import pt.unl.fct.di.adc.firstwebapp.Objects.EventInput;

public class EventTokenRequest extends AbstractTokenInputRequest<EventInput>implements ModelInterface{

	/**
	 * {
	 *   "token": { "tokenId": "<jwt>" },
	 *   "input": { "eventId": "..." }
	 * }
	 */
	
	public EventTokenRequest() {}
	


}