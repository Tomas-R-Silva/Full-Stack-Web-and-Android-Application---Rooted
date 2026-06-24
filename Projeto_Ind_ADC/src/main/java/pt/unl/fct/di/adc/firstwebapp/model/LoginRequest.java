package pt.unl.fct.di.adc.firstwebapp.model;

import java.util.Map;

import pt.unl.fct.di.adc.firstwebapp.Objects.ShortUser;

public class LoginRequest extends AbstractTokenInputRequest<LoginRequest.LoginRequestInput>implements ModelInterface{
    public LoginRequest() {}
    
	/**
	 * {
	 *   "token": { "tokenId": "<jwt>" },
	 *   "input":{ 
	 *   	"username": "...",
	 *   	"password": "..." }
	 * }
	 */    
    
    public static class LoginRequestInput extends ShortUser implements ModelInterface{

    	private String password;
    	
    	public LoginRequestInput() {}
    	
        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
        @Override
    	public Map<String, Object> getformat() {
        Map<String, Object> map=super.getformat();
        map.put("password", ModelInterface.defaultstr);
        return map;
        }

    }
}