package pt.unl.fct.di.adc.firstwebapp.model;

import java.util.List;

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
    	private Long birth;
    	private String country;
    	private List<String> category;
    	private String avatar;
    	private Boolean isPublic;
    	
        public String getEmail() {return email;}
        public void setEmail(String email) {this.email = email;}
        public String getBio() {return bio;}
        public void setBio(String bio) {this.bio = bio;}
        public String getCountry() {return country;}
        public void setCountry(String country) {this.country = country;}
		public Long getBirth() {return birth;}
		public void setBirth(Long birth) {this.birth=birth;}
		public List<String> getCategory() {return category;}
		public void setCategory(List<String> category) {this.category=category;}
		public String getAvatar() {return avatar;}
		public void setAvatar(String avatar) {this.avatar = avatar;}
		public Boolean isPublic() {return isPublic;}
		public void setAvatar(Boolean isPublic) {this.isPublic = isPublic;}
    }

}