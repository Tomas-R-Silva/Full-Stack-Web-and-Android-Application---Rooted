package pt.unl.fct.di.adc.firstwebapp.model;

public class ChangeUserPasswordRequest {
    public PasswordInput input;
    public Token token;

    public ChangeUserPasswordRequest() {}

    public PasswordInput getInput() {
        return input;
    }

    public void setInput(PasswordInput input) {
        this.input = input;
    }

    public Token getToken() {
        return token;
    }

    public void setToken(Token token) {
        this.token = token;
    }

    // Classe interna ou separada, mais limpa
    public static class PasswordInput {
        private String username;
        private String oldpassword;
        private String newpassword;

        public PasswordInput() {}

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

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