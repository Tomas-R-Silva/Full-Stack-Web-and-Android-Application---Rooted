package pt.unl.fct.di.adc.firstwebapp.model;

import pt.unl.fct.di.adc.firstwebapp.model.User.Role;

public class Token extends ShortUser{

    public static final long EXPIRATION_TIME = 15 * 60;
    
    private String tokenId;
    private Role role;
    private long issuedAt;
    private long expiresAt;

    public Token(){
        this(null,null,null);
    }

    public Token(String tokenID, String username,Role role){
        this.tokenId = tokenID;
        this.username = username;
        this.role = role;
        long now = System.currentTimeMillis() / 1000; // segundos
        this.issuedAt = now;
        this.expiresAt = now + EXPIRATION_TIME;
    }


    public String getTokenId(){
        return tokenId;
    }

    public Role getRole(){
        return role;
    }

    public long getIssuedAt(){
        return issuedAt;
    }

    public long getExpiresAt(){
        return expiresAt;
    }

    public void setTokenId(String tokenID){
        this.tokenId = tokenID;
    }

    public void setRole (Role role){
        this.role = role;
    }

    public void setIssuedAt (long issuedAt){
        this.issuedAt = issuedAt;
    }

    public void setExpiresAt (long expiresAt){
        this.expiresAt = expiresAt;
    }

}
