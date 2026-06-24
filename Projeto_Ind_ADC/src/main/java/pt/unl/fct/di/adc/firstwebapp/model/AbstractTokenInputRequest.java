package pt.unl.fct.di.adc.firstwebapp.model;

import java.util.Map;

import pt.unl.fct.di.adc.firstwebapp.Objects.Token;

public abstract class AbstractTokenInputRequest<E extends ModelInterface> extends AbstractInputRequest<E> implements ModelInterface, TokenRequestInterface{
	
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
	
	@Override
	public Map<String, Object> getformat() {
		Map<String, Object> map=super.getformat();
		map.put("token","\"<jwt>\"");
		return map;
	}
}
