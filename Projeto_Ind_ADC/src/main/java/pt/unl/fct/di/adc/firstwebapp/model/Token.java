package pt.unl.fct.di.adc.firstwebapp.model;

import com.google.cloud.Timestamp;


import com.google.appengine.repackaged.io.opencensus.metrics.export.TimeSeries;

import pt.unl.fct.di.adc.firstwebapp.model.User.Role;

public class Token {

    public static final long EXPIRATION_TIME = 15 * 60;
    
    private String tokenId;
    private String username;
    private Role role;
    private long  issuedAt;
    private long expiresAt;

    public Token(){
        this.tokenId = null;
        this.username = null;
        this.role = null;
        long now = System.currentTimeMillis() / 1000; // segundos
        this.issuedAt = now;
        this.expiresAt = now + EXPIRATION_TIME;
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

    public String getUsername(){
        return username;
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

    public void setUsername (String username){
        this.username = username;
    }

    public void setIssuedAt (long issuedAt){
        this.issuedAt = issuedAt;
    }

    public void setExpiresAt (long expiresAt){
        this.expiresAt = expiresAt;
    }

}
