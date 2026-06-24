package pt.unl.fct.di.adc.firstwebapp.error;
import java.util.List;
import java.util.Map;

import jakarta.ws.rs.core.Response;
import pt.unl.fct.di.adc.firstwebapp.Utilities.ResponceBuilder;

public class Error {

	private static final String INVALID_CREDENCIALS="INVALID_CREDENCIALS",
			USER_ALREADY_EXISTS="USER_ALREADY_EXISTS",
			USER_NOT_FOUND="USER_NOT_FOUND",
			INVALID_TOKEN="INVALID_TOKEN",
			TOKEN_EXPIRED="TOKEN_EXPIRED",
			UNAUTHORIZED="UNAUTHORIZED",
			INVALID_INPUT="INVALID_INPUT",
			FORBIDDEN="FORBIDDEN",
			PASSWORD_NOT_CONFIRMATION="PASSWORD_NOT_CONFIRMATION",
			INVALID_ROLE="INVALID_ROLE",
			INVALID_CATEGORY="INVALID_CATEGORY",
			INVALID_LOCATION="INVALID_LOCATION",
			INVALID_ENROLLMENT_DATE_NOW="INVALID_ENROLLMENT_DATE_NOW",
			INVALID_ENROLLMENT_DATE_START="INVALID_ENROLLMENT_DATE_START",
			INVALID_START_DATE="INVALID_START_DATE",
			INVALID_DURATION="INVALID_DURATION",
			INVALID_MAX_ATTENDEES="INVALID_MAX_ATTENDEES",
			INVALID_MIN_ATTENDEES="INVALID_MIN_ATTENDEES",
			INVALID_COVER_IMAGE_URL="INVALID_COVER_IMAGE_URL",
			FRIENDSHIP_ALREADY_EXISTS="FRIENDSHIP_ALREADY_EXISTS",
			INVALID_TITLE="INVALID_TITLE",
			INVALID_DESCRIPTION="INVALID_DESCRIPTION",
			INVALID_ORGANIZER="INVALID_ORGANIZER",
			INVALID_MESSAGE_TEXT="INVALID_MESSAGE_TEXT",
			EVENT_NOT_OPEN_FOR_FORUM="EVENT_NOT_OPEN_FOR_FORUM",
			POST_NOT_FOUND="POST_NOT_FOUND",
			INVALID_EMAIL="INVALID_EMAIL",
			EVENT_FULL="EVENT_FULL",
			FRIEND_SELF="FRIEND_SELF",
			ALREADY_FRIEND="ALREADY_FRIEND",
			FRIEND_REQUEST_ALREADY_SENT="FRIEND_REQUEST_ALREADY_SENT",
			WRONG_JSON_STRUCTURE="WRONG_JSON_STRUCTURE";
	

	public static void invalid_input(List<Map<String,Object>> list) throws ErrorException{
		ErrorException.trow(9906,list);
	}

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

	public static Map<String,Object> createmap(int status){
		return Map.of("status", status, "data", errorswitchstr(status));
	}

	private static Response errorswitch(int status) {
		return ResponceBuilder.constructor(status,errorswitchstr(status));
	}

	private static String errorswitchstr(int status){
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
		case 9909->data=PASSWORD_NOT_CONFIRMATION;
		case 9910->data=INVALID_ROLE;
		case 9911->data=INVALID_CATEGORY;
		case 9912->data=INVALID_LOCATION;
		case 9913->data=INVALID_ENROLLMENT_DATE_NOW;
		case 9914->data=INVALID_ENROLLMENT_DATE_START;
		case 9915->data=INVALID_START_DATE;
		case 9916->data=INVALID_DURATION;
		case 9917->data=INVALID_MAX_ATTENDEES;
		case 9918->data=INVALID_MIN_ATTENDEES;
		case 9919->data=INVALID_COVER_IMAGE_URL;
		case 9920->data=FRIENDSHIP_ALREADY_EXISTS;
		case 9921->data=INVALID_TITLE;
		case 9922->data=INVALID_DESCRIPTION;
		case 9923->data=INVALID_ORGANIZER;
		case 9924->data=INVALID_EMAIL;
		case 9925->data=FRIEND_SELF;
		case 9926->data=ALREADY_FRIEND;
		case 9927->data=FRIEND_REQUEST_ALREADY_SENT;
		case 9928->data=EVENT_FULL;
		case 9929->data=WRONG_JSON_STRUCTURE;
		case 9930->data=INVALID_MESSAGE_TEXT;
		case 9931->data=EVENT_NOT_OPEN_FOR_FORUM;
		case 9932->data=POST_NOT_FOUND;
		default->data="";
		}
		return data;
	}

	public static Response fromexception(Exception e) {
		if(e instanceof ErrorException) {
			ErrorException ex=(ErrorException)e;
			int status=ex.getStatus();
			if(status==9906&&ex.getdata()!=null)
				return ResponceBuilder.constructor(status,ex.getdata());
			else
				return errorswitch(status);
		}
		return errorswitch(9907);
	}	
}


