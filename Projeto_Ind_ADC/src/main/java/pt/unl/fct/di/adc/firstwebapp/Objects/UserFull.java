package pt.unl.fct.di.adc.firstwebapp.Objects;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.commons.codec.digest.DigestUtils;

import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.Entity.Builder;
import com.google.cloud.datastore.Key;

import pt.unl.fct.di.adc.firstwebapp.Objects.EventFull.Category;
import pt.unl.fct.di.adc.firstwebapp.Objects.User.Friendstatus;
import pt.unl.fct.di.adc.firstwebapp.Objects.User.Role;

public class UserFull extends ShortUser implements Full{
	private String password;
	private Role role;
	private String email;
	private String display;
	private long creation;
	private List<Category> category;
	private List<String> old;
	private long birth;
	private String country;
	private final Key key;

	@Override
	public Key getKey() {return key;}
	public String getPassword() {return password;}
	public void setPassword(String password) {this.password = DigestUtils.sha512Hex(password);}
	private void setbasePassword(String password) {this.password = password;}
	public String getEmail(){return email;}
	public void setEmail(String email){this.email = email;}
	public Role getRole() {return role;}
	public void setRole(String role) {this.role = Role.valueof(role);}
	public void setRole(Role role) {this.role = role;}
	public String getDisplay() {return display;}
	public void setDisplay(String display) {this.display=display;if(!old.contains(display))old.add(display);}
	private void setbaseDisplay(String display) {this.display=display;}
	public void setCountry(String country) {this.country=country;}
	public String getCountry() {return country;}
	private void setbaseCreation(long creation) {this.creation=creation*TIME_DIVIDER;}
	private void setbaseBirth(long birth) {this.birth=birth*TIME_DIVIDER;}
	private void setbaseCategory(List<Category> category) {this.category=category;}
	public void setOld(List<String> old){this.old=old;}

	private UserFull(Key key) {this.key=key;}

	public static UserFull newuser(User user, Key userKey) {
		UserFull newuser=new UserFull(userKey);
		newuser.setUsername(user.getUsername());
		newuser.setEmail(user.getEmail());
		newuser.setPassword(user.getPassword());
		newuser.setRole(user.getRole());
		newuser.setDisplay(user.getUsername());
		newuser.setOld(List.of(user.getUsername()));
		newuser.setbaseCreation(System.currentTimeMillis());
		
		
		newuser.setbaseCategory(List.of());
		newuser.setCountry("");
		newuser.setbaseBirth(0);
		
		return newuser;
		
	}
	
	@Override
	public Map<String,Object> tomap(){
		return Map.of(
				"username", Full.string(username),
				"display", Full.string(display),
				"email", Full.string(email),
				"role", Full.string(role.name())
				);
	}
	public Map<String,Object> tobigmap(String display,Friendstatus friendshipstatus){
		Map<String,Object> map=this.tomap();
		map.put("friendship",friendshipstatus.toString());
		if(display!=null)
			map.put("display",Full.string(display));
		map.put("creation_time",creation);
		map.put("oldnames",old);
		return map;
	}

	public boolean isme(String username) {
		return this.username.equals(username);
	}
	public boolean isme(TokenFull token) {
		return this.username.equals(token.username);
	}

	@Override
	public Entity toentity() {
		Builder newUser = Entity.newBuilder(key);
		newUser.set("user_name", username);
		newUser.set("user_email", email);
		newUser.set("user_pwd", password);
		newUser.set("user_role", role.name());
		newUser.set("user_display", display);
		newUser.set("user_creation_time", creation / TIME_DIVIDER);
		newUser.set("birth_time", birth / TIME_DIVIDER);
		newUser.set("country", country);
		newUser.set("old_display", Full.makeStringValueList(old));
		newUser.set("category", Full.makeStringValueEnumList(category));
		return newUser.build();
	}
	
	public static UserFull fromdatabase(Entity entity) {
		if(entity==null)return null;
		UserFull user=new UserFull(entity.getKey());
		user.setUsername(Full.getString(entity,"user_name"));
		user.setEmail(Full.getString(entity,"user_email"));
		user.setbasePassword(Full.getString(entity,"user_pwd"));
		user.setRole(Full.getString(entity,"user_role"));
		user.setbaseDisplay(Full.getString(entity,"user_display"));
		user.setCountry(Full.getString(entity,"country"));
		user.setbaseCreation(Full.getLong(entity,"user_creation_time")*TIME_DIVIDER);
		user.setbaseBirth(Full.getLong(entity,"birth_time")*TIME_DIVIDER);
		user.setOld(Full.getStringList(entity,"old_display"));
		user.setbaseCategory(Full.getStringValueList(entity,"category").stream().map(v -> Category.valueof( v.get())).collect(Collectors.toList()));
		
		return user;
	}

	@Override
	public Map<String, Object> tomap(Entity e) {return fromdatabase(e).tomap();}
}
