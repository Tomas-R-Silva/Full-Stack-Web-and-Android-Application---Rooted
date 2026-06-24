package pt.unl.fct.di.adc.firstwebapp.model;
import pt.unl.fct.di.adc.firstwebapp.Objects.User;

public class UserRequest extends AbstractInputRequest<User>implements ModelInterface{
	
	/**
	 * {
	 *   "token": { "tokenId": "<jwt>" },
	 *   "input": {
	 *   	"username": "...",
	 *   	"password": "...",
	 * 	 	"confirmation": "...",
	 *	 	"role": "...",
	 *	 	"email": "..."}
	 * }
	 */
	
	public UserRequest() {}	
}
