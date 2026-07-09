package pt.unl.fct.di.adc.firstwebapp.model;

import pt.unl.fct.di.adc.firstwebapp.Objects.ShortUser;

public class ModAccountRequest extends AbstractTokenInputRequest<ModAccountRequest.ModAccountRequestInput>{

    public ModAccountRequest() {}

    public static class ModAccountRequestInput extends ShortUser{
        private String email;
        private String bio;


        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getBio() {
            return bio;
        }

        public void setBio(String bio) {
            this.bio = bio;
        }
    }

}