package pt.unl.fct.di.adc.firstwebapp.model;


/**
 * Represents a user in the system.
 * The create account creates an user
 */
public class User {

    public enum Role {
        USER,
        BOFFICER,
        ADMIN
    }

    private String username;	
    private String password;
    private String confirmation;
    private String phone;
    private String address;
    private Role role;

    public User() {
    }

    public User(String username, String password,String confirmation, String phone, String address, Role role) {
        this.password = password;
        this.username = username;
        this.confirmation = confirmation;
        this.phone = phone;
        this.address = address;
        this.role = role;

    }


    public String getUsername() {
        return username;
    }

    public void setUsername(String userName) {
        this.username = userName;
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
        if (getUsername() == null || getUsername().isBlank() ||
		getPassword() == null || getPassword().isBlank() ||
	    getConfirmation() == null || getConfirmation().isBlank() ||
		getPhone() == null || getPhone().isBlank() ||
		getAddress() == null || getAddress().isBlank() ||
		getRole() == null ||
		!getPassword().equals(getConfirmation())) {
            return false;
        }
        else{
            return true;
        }
    }

    @Override
    public String toString() {
        return "User{" +
                "userName='" + username + '\'' +
                ", password='" + password + '\'' +
                ", confirmation='" + confirmation + '\'' +
                ", phone='" + phone + '\'' +
                ", address='" + address + '\'' +
                ", role=" + (role != null ? role.name() : "null") +
                '}';
    }
}