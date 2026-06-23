package pt.unl.fct.di.adc.firstwebapp.model;

public class ChangeUserRole extends AbstractTokenInputRequest<ChangeUserRole.ChangeUserRoleInput>{

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