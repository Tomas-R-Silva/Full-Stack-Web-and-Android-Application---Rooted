package pt.unl.fct.di.adc.firstwebapp.model;

import java.util.Map;

import pt.unl.fct.di.adc.firstwebapp.Objects.ShortUser;

public class ChangeUserRole extends AbstractTokenInputRequest<ChangeUserRole.ChangeUserRoleInput>implements ModelInterface{

	/**
	 * {
	 *   "token": { "tokenId": "<jwt>" },
	 *   "input": {
	 *   	"username": "...",
	 *   	"newrole": "..." }
	 * }
	 */
	
    public ChangeUserRole(){}
 
    public static class ChangeUserRoleInput extends ShortUser implements ModelInterface{
        public String newrole;

        public String getNewrole(){
            return newrole;
        }

        public void setNewrole(String newrole){
            this.newrole = newrole;
        }
        @Override
    	public Map<String, Object> getformat() {
        Map<String, Object> map=super.getformat();
        map.put("newrole", ModelInterface.defaultstr);
        return map;
        }
    }
}