package pt.unl.fct.di.adc.firstwebapp.error;
import jakarta.ws.rs.core.Response;
import pt.unl.fct.di.adc.firstwebapp.Utilities.ResponceBuilder;

public class Error {

	private static final String INVALID_INPUT="INVALID_INPUT",
			USER_ALREADY_EXISTS="USER_ALREADY_EXISTS",
			TOKEN_EXPIRED="TOKEN_EXPIRED",
			UNAUTHORIZED="UNAUTHORIZED",
			USER_NOT_FOUND="USER_NOT_FOUND",
			INVALID_CREDENCIALS="INVALID_CREDENCIALS",
			FORBIDDEN="FORBIDDEN",
			INVALID_TOKEN="INVALID_TOKEN";

	public static Response invalid_input(){
		return errorswitch(9906);
	}

	public static Response user_already_exists(){
		return errorswitch(9901);
	}

	public static Response token_expired(){
		return errorswitch(9904);
	}

	public static Response unauthorized(){
		return errorswitch(9905);
	}

	public static Response user_not_found(){
		return errorswitch(9902);
	}

	public static Response invalid_credencials(){
		return errorswitch(9900);
	}

	public static Response forbidden(){
		return errorswitch(9907);
	}

	public static Response invalid_token(){
		return errorswitch(9903);
	}

	private static Response errorswitch(int status){
		String data;
		switch(status){
		case 9900->data=INVALID_CREDENCIALS;
		case 9901->data=USER_ALREADY_EXISTS;
		case 9902->data=USER_NOT_FOUND;
		case 9903->data=INVALID_TOKEN;
		case 9904->data=TOKEN_EXPIRED;
		case 9905->data=UNAUTHORIZED;
		case 9906->data=INVALID_INPUT;
		case 9907->data=FORBIDDEN;
		default->data="";
		}
		return ResponceBuilder.constructor(String.format("%d",status),data);
	}

	public static Response fromexception(Exception e) {
		if(e instanceof ErrorException)
			return errorswitch(((ErrorException)e).getStatus());
		return errorswitch(9907);
	}	
}


