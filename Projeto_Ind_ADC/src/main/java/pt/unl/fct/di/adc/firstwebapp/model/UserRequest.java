package pt.unl.fct.di.adc.firstwebapp.model;
import pt.unl.fct.di.adc.firstwebapp.Objects.User;

public class UserRequest extends AbstractInputRequest<User>{
	
	/**
	 * {
	 *   "token": { "jwt": "<jwt>" },
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
