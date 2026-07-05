package pt.unl.fct.di.adc.firstwebapp.model;

import pt.unl.fct.di.adc.firstwebapp.Objects.ModelToken;

public class TokenRequest implements TokenRequestInterface{
	
	/**
	 * {
	 *   "token": { "tokenId": "<jwt>" }
	 * }
	 */
	public ModelToken token;
	
	public TokenRequest() {}
	
	public ModelToken getToken() {
        return token;
    }
	
	public void setToken(ModelToken token) {
        this.token = token;
    }

}
