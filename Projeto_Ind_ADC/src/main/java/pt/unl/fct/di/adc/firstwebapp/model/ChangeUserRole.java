package pt.unl.fct.di.adc.firstwebapp.model;


public class ChangeUserRole {
    public Input input;
    public Token token;

    public ChangeUserRole(){}

    public Input getInput(){
        return input;
    }

    public Token getToken(){
        return token;
    }

    public void setToken(Token token){
        this.token = token;
    }

    public void setInput(Input input){
        this.input = input;
    }

    public static class Input {
        public String username;
        public String newrole;

        public String getUsername(){
            return username;
        }

        public String getNewrole(){
            return newrole;
        }

        public void setUsername(String username){
            this.username = username;
        }

        public void setNewrole(String newrole){
            this.newrole = newrole;
        }

    }
}