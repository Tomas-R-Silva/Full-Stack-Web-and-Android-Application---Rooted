package pt.unl.fct.di.adc.firstwebapp.model;

import pt.unl.fct.di.adc.firstwebapp.Objects.ShortUser;

public class LoginRequest extends AbstractTokenInputRequest<LoginRequest.LoginRequestInput>{
    public LoginRequest() {}
    
	/**
	 * {
	 *   "token": { "tokenId": "<jwt>" },
	 *   "input":{ 
	 *   	"username": "...",
	 *   	"password": "..." }
	 * }
	 */    
    
    public static class LoginRequestInput extends ShortUser{

    	private String password;
    	
    	public LoginRequestInput() {}
    	
        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}