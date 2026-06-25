package pt.unl.fct.di.adc.firstwebapp.model;

import pt.unl.fct.di.adc.firstwebapp.Objects.ShortUser;

public class ShortUserTokenRequest extends AbstractTokenInputRequest<ShortUser>implements ModelInterface,TokenRequestInterface{
	
	/**
	 * {
	 *   "token": { "tokenId": "<jwt>" },
	 *   "input": { "username": "..." }
	 * }
	 */
	
    public ShortUserTokenRequest(){}
}
