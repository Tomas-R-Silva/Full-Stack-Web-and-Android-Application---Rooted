package pt.unl.fct.di.adc.firstwebapp.model;

import pt.unl.fct.di.adc.firstwebapp.Objects.Token;

public abstract class AbstractTokenInputRequest<E> extends AbstractInputRequest<E> implements TokenRequestInterface{
	
	/**
	 * {
	 *   "token": { "tokenId": "<jwt>" }, 
	 *   "input": E
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
