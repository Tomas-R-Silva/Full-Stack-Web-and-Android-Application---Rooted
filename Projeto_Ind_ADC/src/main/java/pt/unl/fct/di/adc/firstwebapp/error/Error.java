package pt.unl.fct.di.adc.firstwebapp.error;
import java.util.Map;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;

public class Error {

    private final int OK = 200;
    
    public Error(){}

    public Response invalid_input(){
        return Response.ok(OK).entity(Map.of("status", "9906","data", "INVALID_INPUT")).build();
	}

    public Response user_already_exists(){
        return Response.ok(OK).entity(Map.of("status", "9901","data", "USER_ALREADY_EXISTS")).build();
	}

    public Response token_expired(){
        return Response.ok(Status.OK)
					.entity(Map.of(
						"status", "9904",
						"data" , "TOKEN_EXPIRED"
				  )).build();
    }

    public Response unauthorized(){
        return Response.ok(OK)
					.entity(Map.of(
						"status", "9905",
						"data" , "UNAUTHORIZED"
				  )).build();
    }

    public Response user_not_found(){
        return Response.ok(OK)
				  .entity(Map.of(
					"status", "9902",
					"data" , "USER_NOT_FOUND"
				  )).build();
    }

    public Response invalid_credencials(){
        return Response.ok(OK)
				   .entity(Map.of(
					"status", "9900",
					"data" , "INVALID_CREDENCIALS"
				   )).build();
    }

    public Response forbidden(){
        return Response.ok(OK)
				   .entity(Map.of(
					"status", "9907",
					"data" , "FORBIDDEN"
				   )).build();
    }

    public Response invalid_token(){
        return Response.ok(OK)
				   .entity(Map.of(
					"status", "9903",
					"data" , "INVALID_TOKEN"
				   )).build();
    }

 }


