package pt.unl.fct.di.adc.firstwebapp.model;

    public class ShowUsersRequest {

    private User input;
    private Token token;

    public ShowUsersRequest(){}


    public Token getToken(){
        return token;
    }

    public void setToken(Token token){
        this.token = token;
    }

    public void setInput (User input){
        this.input = input;
    }

    public User getInput(){
        return input;
    }
}