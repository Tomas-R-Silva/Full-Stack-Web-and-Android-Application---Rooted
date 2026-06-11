package pt.unl.fct.di.adc.firstwebapp.model;

public abstract class AbstractTokenRequest {
	public Token token;
	
	public AbstractTokenRequest() {}
	
	public Token getToken() {
        return token;
    }
	
	public void setToken(Token token) {
        this.token = token;
    }
}
