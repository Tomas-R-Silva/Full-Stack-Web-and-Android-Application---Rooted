package pt.unl.fct.di.adc.firstwebapp.model;

import pt.unl.fct.di.adc.firstwebapp.error.ErrorException;

/**
 * Represents a user in the system.
 * The create account creates an user
 */
public class User extends ShortUser{

	public enum Role {
		USER,
		BOFFICER,
		ADMIN;
		public static Role valueof(String v) throws ErrorException {
			Role role;
			try{
				role=Role.valueOf(v);
			}catch (Exception e) {
				role=null;
				}
			return role;
		}
	}
	
	private String password;
	private String confirmation;
	private String phone;
	private String address;
	private Role role;

	public User() {}

	public User(String username, String password,String confirmation, String phone, String address, Role role) {
		this.password = password;
		this.username = username;
		this.confirmation = confirmation;
		this.phone = phone;
		this.address = address;
		this.role = role;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}


	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getConfirmation(){
		return confirmation;
	}

	public void setConfirmation(String confirmation){
		this.confirmation = confirmation;
	}


	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}
	
	public boolean userValidation(){
		return validVariable(getUsername()) &&
			   validVariable(getPassword()) &&
			   validVariable(getConfirmation()) &&
			   validphone() &&
			   validVariable(getAddress()) &&
			   getRole() != null &&
			   getPassword().equals(getConfirmation());      
	}

	public static boolean validVariable(String var){
		return var != null && !var.isBlank();
	}

	public boolean validphone(){
		boolean valid=validVariable(getPhone());
		int count=0;
		if(getPhone().charAt(count)=='+')count++;
		while(valid&&count<getPhone().length())
			switch(getPhone().charAt(count++)) {
			case'0':case'1':case'2':
			case'3':case'4':case'5':
			case'6':case'7':case'8':
			case'9':break;
			default:valid=false;
			}
		return valid;
	}

	@Override
	public String toString() {
		final String str="User{userName=%s, password=%s, confirmation=%s, phone=%s, address=%s, role=%s}";
		return String.format(str, username,password,confirmation,phone,address,(role!=null?role.name():"null"));
	}
}