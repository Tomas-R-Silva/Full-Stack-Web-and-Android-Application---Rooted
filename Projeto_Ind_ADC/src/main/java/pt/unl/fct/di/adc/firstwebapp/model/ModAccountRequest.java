package pt.unl.fct.di.adc.firstwebapp.model;

import pt.unl.fct.di.adc.firstwebapp.Objects.ShortUser;

public class ModAccountRequest extends AbstractTokenInputRequest<ModAccountRequest.ModAccountRequestInput>{

    public ModAccountRequest() {}

    public static class ModAccountRequestInput extends ShortUser{
        private String email;


        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }  
    }

}