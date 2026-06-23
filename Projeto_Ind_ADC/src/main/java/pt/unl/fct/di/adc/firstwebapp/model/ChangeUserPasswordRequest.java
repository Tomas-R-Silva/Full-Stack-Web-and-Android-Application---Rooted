package pt.unl.fct.di.adc.firstwebapp.model;

import pt.unl.fct.di.adc.firstwebapp.Objects.ShortUser;

public class ChangeUserPasswordRequest extends AbstractTokenInputRequest<ChangeUserPasswordRequest.PasswordInput>{

	/**
	 * {
	 *   "token": { "tokenId": "<jwt>" },
	 *   "input": {
	 *   	"username": "...",
	 *   	"oldpassword": "...",
	 * 	 	"newpassword": "..." }
	 * }
	 */
	
    public ChangeUserPasswordRequest() {}

    // Classe interna ou separada, mais limpa
    public static class PasswordInput extends ShortUser{
        private String oldpassword;
        private String newpassword;

        public PasswordInput() {}

        public String getOldpassword() {
            return oldpassword;
        }

        public void setOldpassword(String oldPassword) {
            this.oldpassword = oldPassword;
        }

        public String getNewpassword() {
            return newpassword;
        }

        public void setNewpassword(String newPassword) {
            this.newpassword = newPassword;
        }
    }
}