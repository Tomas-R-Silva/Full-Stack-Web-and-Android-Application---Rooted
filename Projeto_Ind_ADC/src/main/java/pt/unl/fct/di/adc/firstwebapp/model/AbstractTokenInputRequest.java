package pt.unl.fct.di.adc.firstwebapp.model;

public abstract class AbstractTokenInputRequest<E> extends AbstractInputRequest<E>{
	
	/**
	 * {
	 *   "token": { "tokenId": "<jwt>" }, 
	 *   "input": "..."
	 * }
	 */
	public Token token;
	
	public AbstractTokenInputRequest() {}
	
	public Token getToken() {
        return token;
    }
	
	public void setToken(Token token) {
        this.token = token;
    }
}
