package pt.unl.fct.di.adc.firstwebapp.Utilities;

import java.util.Map;

import jakarta.ws.rs.core.Response;

public class ResponceBuilder {
	private static final int OK = 200;
	public static Response constructor(String status,Object data){
        return Response.ok(OK).entity(Map.of("status", status,"data", data)).build();
	}

}
