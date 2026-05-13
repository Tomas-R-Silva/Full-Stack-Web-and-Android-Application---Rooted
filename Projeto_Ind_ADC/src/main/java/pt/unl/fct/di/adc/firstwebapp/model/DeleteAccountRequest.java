package pt.unl.fct.di.adc.firstwebapp.model;

public class DeleteAccountRequest {
    public User input;
    public Token token;

    public DeleteAccountRequest(){}

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
