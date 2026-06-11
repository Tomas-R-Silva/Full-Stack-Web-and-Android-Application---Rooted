package pt.unl.fct.di.adc.firstwebapp.model;

public class LoginRequest extends AbstractShortUserRequest<LoginRequest.LoginRequestInput>{
    public LoginRequest() {}
    
    public class LoginRequestInput extends ShortUser{

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