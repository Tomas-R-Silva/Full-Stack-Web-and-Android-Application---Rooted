package pt.unl.fct.di.adc.firstwebapp.model;

import java.util.Map;

import pt.unl.fct.di.adc.firstwebapp.Objects.ShortUser;

public class ChangeUserPasswordRequest extends AbstractTokenInputRequest<ChangeUserPasswordRequest.PasswordInput>implements ModelInterface{

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
    public static class PasswordInput extends ShortUser implements ModelInterface{
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
        @Override
    	public Map<String, Object> getformat() {
        Map<String, Object> map=super.getformat();
        map.put("oldpassword", ModelInterface.defaultstr);
        map.put("oldpassword", ModelInterface.defaultstr);
        return map;
        }
    }
}