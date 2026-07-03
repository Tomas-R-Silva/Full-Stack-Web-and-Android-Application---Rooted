package pt.unl.fct.di.adc.firstwebapp.Objects;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import pt.unl.fct.di.adc.firstwebapp.error.Error;
import pt.unl.fct.di.adc.firstwebapp.error.ErrorException;

/**
 * Represents a user in the system.
 * The create account creates an user
 */
public class User extends ShortUser{
	
	/**
	 * {
	 *   "username": "...",
	 *   "password": "...",
	 * 	 "confirmation": "...",
	 *	 "role": "...",
	 *	 "email": "..."
	 * }
	 */

	public enum Role {
		USER,
		BOFFICER,
		ADMIN;
		public static Role valueof(String v) {
			try{return Role.valueOf(v);}catch (Exception e) {return null;}
		}
	}
	
	public enum Friendstatus {
		NOT_FRIENDS,
		FRIENDS,
		REQUEST_SENT,
		REQUEST_RECIVED;
		public static Friendstatus valueof(String v) {
			try{return Friendstatus.valueOf(v);}catch (Exception e) {return null;}
		}
	}

	private String password;
	private String confirmation;
	private String role;
	private String email;

	public User() {}

	public User(String username, String password,String confirmation, String role, String email) {
		this.password = password;
		this.username = username;
		this.confirmation = confirmation;
		this.email = email;
		this.role = role;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getEmail(){
		return email;
	}

	public void setEmail(String email){
		this.email = email;
	}

	public String getConfirmation(){
		return confirmation;
	}

	public void setConfirmation(String confirmation){
		this.confirmation = confirmation;
	}

	public Role getRole() {
		return Role.valueof(role);
	}

	public void setRole(String role) {
		this.role = role;
	}

	public void userValidation() throws ErrorException{
		List<Map<String,Object>> list=new LinkedList<>();
		if(!validVariable(getUsername()))
			list.add(Error.createmap(9902));
		if(!(validVariable(getPassword())&&validVariable(getConfirmation())&&getPassword().equals(getConfirmation())))
			list.add(Error.createmap(9909));
		if(getRole()==null)
			list.add(Error.createmap(9910));
		if(!validEmail(getEmail()))
			list.add(Error.createmap(9924));
		if(!list.isEmpty())
			Error.invalid_input(list);
	}

	public static boolean validVariable(String var){
		return var != null && !var.isBlank();
	}

	private static final java.util.regex.Pattern EMAIL_PATTERN =
			java.util.regex.Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

	public static boolean validEmail(String email){
		return validVariable(email) && EMAIL_PATTERN.matcher(email).matches();
	}

	@Override
	public String toString() {
		final String str="User{userName=%s, password=%s, confirmation=%s, role=%s}";
		return String.format(str, username,password,confirmation,role);
	}
}