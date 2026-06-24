package pt.unl.fct.di.adc.firstwebapp.Objects;

import java.util.Map;

import pt.unl.fct.di.adc.firstwebapp.model.ModelInterface;

public class ShortUser implements ModelInterface{

	/**
	 * { "username": "..." }
	 */
	
	protected String username;
	
	public ShortUser() {}
	
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
    
	@Override
	public Map<String, Object> getformat() {
		return Map.of("username",ModelInterface.defaultstr);
	}

}
