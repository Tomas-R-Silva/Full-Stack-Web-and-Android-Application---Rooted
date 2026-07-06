package pt.unl.fct.di.adc.firstwebapp.model;

import pt.unl.fct.di.adc.firstwebapp.Objects.ShortUser;

public class ChangeUserRole extends AbstractTokenInputRequest<ChangeUserRole.ChangeUserRoleInput>{

	/**
	 * {
	 *   "token": { "jwt": "<jwt>" },
	 *   "input": {
	 *   	"username": "...",
	 *   	"newrole": "..." }
	 * }
	 */
	
    public ChangeUserRole(){}
 
    public static class ChangeUserRoleInput extends ShortUser{
        public String newrole;

        public String getNewrole(){
            return newrole;
        }

        public void setNewrole(String newrole){
            this.newrole = newrole;
        }

    }
}