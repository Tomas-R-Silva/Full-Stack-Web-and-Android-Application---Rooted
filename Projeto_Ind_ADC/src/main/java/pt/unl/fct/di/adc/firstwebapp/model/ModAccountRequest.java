package pt.unl.fct.di.adc.firstwebapp.model;

import pt.unl.fct.di.adc.firstwebapp.Objects.ShortUser;

/**
 * POST /rest/modaccount — updates the authenticated user's account.
 * All "input" fields are optional; only the ones present are changed.
 *
 * {
 *   "token": { "jwt": "<jwt>" },
 *   "input": {
 *       "username": "<new display name>",   // optional: changes user_display
 *       "email":    "<new email>",          // optional
 *       "bio":      "<new biography>"        // optional
 *   }
 * }
 */
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