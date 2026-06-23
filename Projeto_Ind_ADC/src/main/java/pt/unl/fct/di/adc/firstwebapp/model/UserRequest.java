package pt.unl.fct.di.adc.firstwebapp.model;

public class UserRequest extends AbstractInputRequest<pt.unl.fct.di.adc.firstwebapp.model.User>{
	
	/**
	 * {
	 *   "token": { "tokenId": "<jwt>" },
	 *   "input": {
	 *   "username": "...",
	 *   "password": "...",
	 * 	 "confirmation": "...",
	 *	 "role": "...",
	 *	 "email": "..."}
	 * }
	 */
	
	public UserRequest() {}	
}
