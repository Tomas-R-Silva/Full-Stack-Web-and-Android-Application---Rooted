package pt.unl.fct.di.adc.firstwebapp.model;

public class LogOutRequest {
    private User input;
    private Token token;

    public LogOutRequest(){}

     public User getInput(){
        return input;
    }

    public Token getToken(){
        return token;
    }

    public void setToken(Token token){
        this.token = token;
    }

    public void setInput(User input){
        this.input = input;
    }
}
