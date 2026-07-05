package pt.unl.fct.di.adc.firstwebapp.model;

import pt.unl.fct.di.adc.firstwebapp.Objects.ModelToken;

public abstract class AbstractTokenInputRequest<E> extends AbstractInputRequest<E> implements TokenRequestInterface{
	
	/**
	 * {
	 *   "token": { "tokenId": "<jwt>" }, 
	 *   "input": E
	 * }
	 */
	public ModelToken token;
	
	public AbstractTokenInputRequest() {}
	
	public ModelToken getToken() {
        return token;
    }
	
	public void setToken(ModelToken token) {
        this.token = token;
    }
}
