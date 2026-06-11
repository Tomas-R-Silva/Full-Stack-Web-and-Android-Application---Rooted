package pt.unl.fct.di.adc.firstwebapp.model;

public abstract class AbstractTokenUserRequest<E extends ShortUser> extends AbstractShortUserRequest<E>{
	public Token token;
	
	public AbstractTokenUserRequest() {}
	
	public Token getToken() {
        return token;
    }
	
	public void setToken(Token token) {
        this.token = token;
    }
}
