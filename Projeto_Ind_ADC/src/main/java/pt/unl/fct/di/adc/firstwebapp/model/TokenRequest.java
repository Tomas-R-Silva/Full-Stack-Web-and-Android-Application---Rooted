package pt.unl.fct.di.adc.firstwebapp.model;

import pt.unl.fct.di.adc.firstwebapp.Objects.Token;

public class TokenRequest {
	
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
}
