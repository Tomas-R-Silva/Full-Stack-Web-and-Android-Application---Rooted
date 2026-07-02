package pt.unl.fct.di.adc.firstwebapp.model;

import java.util.Map;

import pt.unl.fct.di.adc.firstwebapp.Objects.Token;

public class TokenRequest implements ModelInterface, TokenRequestInterface{
	
	/**
	 * {
	 *   "token": { "tokenId": "<jwt>" }
	 * }
	 */
	public Token token;
	
	public TokenRequest() {}
	
	public Token getToken() {
        return token;
    }
	
	public void setToken(Token token) {
        this.token = token;
    }

	@Override
	public Map<String, Object> getformat() {
		return Map.of("token","\"<jwt>\"");
	}

	@Override
	public <E extends ModelInterface> Class<E> Getinputclass() {
		return null;
	}

}
