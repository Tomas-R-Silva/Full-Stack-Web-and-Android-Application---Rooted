package pt.unl.fct.di.adc.firstwebapp.Objects;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
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
	private String bio;
	private boolean isPublic;
	private List<Long> ods;
	private String borderID;
	private long points;
	private final Key key;

	private static final int ODS_COUNT = 17;

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
	public boolean isRole(Role[] roles) {for(Role qrole:roles)if(qrole.equals(role))return true;return false;}	
	public String getDisplay() {return display;}
	public void setDisplay(String display) {this.display=display;if(!old.contains(display))old.add(display);}
	private void setbaseDisplay(String display) {this.display=display;}
	public void setCountry(String country) {this.country=country;}
	public String getCountry() {return country;}
	private void setbaseCreation(long creation) {this.creation=creation*TIME_DIVIDER;}
	private void setbaseBirth(long birth) {this.birth=birth*TIME_DIVIDER;}
	public void setBirth(long birth) {this.birth=birth;}
	public long getBirth() {return birth;}
	public boolean isPublic() { return isPublic; }
	public void setPublic(boolean isPublic) { this.isPublic = isPublic; }
	private void setbaseCategory(List<Category> category) {this.category=category;}
	public void setbaseCategorystr(List<String> category) {this.category= (category!=null)?category.stream().map(v -> Category.valueof(v)).collect(Collectors.toList()):Collections.emptyList();}
	public void setOld(List<String> old){this.old=old;}
    public String getBio() {return bio;}
    public void setBio(String bio) {this.bio = bio;}
	public List<Long> getOds() {return ods;}
	// ods is kept as a fixed-size list of 17 counts (index i = SDG i+1).
	public void setOds(List<Long> ods) {this.ods = (ods==null||ods.isEmpty())?new ArrayList<>(Collections.nCopies(ODS_COUNT, 0L)):ods;}
	public String getBorderID() {return borderID;}
	public void setBorderID(String borderID) {this.borderID = (borderID!=null)?borderID:"";}
	public long getPoints() {return points;}
	private void setbasePoints(long points) {this.points = points;}

	// Registers participation in an event: +1 in the count of each of its SDGs and +1 point per SDG.
	public void addParticipation(List<Long> sdgs) {
		if(sdgs==null) return;
		for(Long s:sdgs)
			if(s!=null && s>=1 && s<=ODS_COUNT) {
				int i=(int)(s-1);
				ods.set(i, ods.get(i)+1);
				points++;
			}
	}

	private UserFull(Key key) {this.key=key;}

	public static UserFull newuser(User user, Key userKey) {
		UserFull newuser=new UserFull(userKey);
		newuser.setUsername(user.getUsername());
		newuser.setEmail(user.getEmail());
		newuser.setPassword(user.getPassword());
		newuser.setRole(user.getRole());
		newuser.setOld(List.of(user.getUsername()));
		newuser.setDisplay(user.getUsername());
		newuser.setbaseCreation(System.currentTimeMillis());
		newuser.setbaseCategorystr(user.getCategory());
		newuser.setPublic(user.isPublic());
		newuser.setCountry("");
		newuser.setbaseBirth(0);
		newuser.setBio("");
		newuser.setOds(null);
		newuser.setBorderID("");
		newuser.setbasePoints(0);

		return newuser;
		
	}
	
	@Override
	public Map<String,Object> tomap(){
		Map<String,Object> map=new HashMap<>();
		map.put("username",Full.string(username));
		map.put("display",Full.string(display));
		map.put("email",Full.string(email));
		map.put("role",Full.string(role.name()));
		return map;
	}
	public Map<String,Object> tobigmap(String display,Friendstatus friendshipstatus){
		Map<String,Object> map=this.tomap();
		map.put("friendship",friendshipstatus.toString());
		map.put("display",Full.string(display));//may be friend nickname or user display name
		map.put("creation_time",creation);
		map.put("oldnames",Full.list(old));
		map.put("isPublic", isPublic);
		map.put("bio",Full.string(bio));
		map.put("category",Full.makeStringEnumList(category));
		map.put("country",Full.string(country));
		map.put("birth",birth);
		map.put("ods",Full.list(ods));
		map.put("borderID",Full.string(borderID));
		map.put("points",points);
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
		newUser.set("is_public", isPublic);
		newUser.set("user_bio", bio);
		newUser.set("old_display", Full.makeStringValueList(old));
		newUser.set("category", Full.makeStringValueEnumList(category));
		newUser.set("user_ods", Full.makeLongValueList(ods));
		newUser.set("user_border", (borderID!=null)?borderID:"");
		newUser.set("user_points", points);
		return newUser.build();
	}
	
	public static UserFull fromdatabase(Entity entity) {
		if(entity==null)return null;
		UserFull user=new UserFull(entity.getKey());
		user.setUsername(Full.getString(entity,"user_name"));
		user.setEmail(Full.getString(entity,"user_email"));
		user.setbasePassword(Full.getString(entity,"user_pwd"));
		user.setRole(Full.getString(entity,"user_role"));
		user.setBio(Full.getString(entity,"user_bio"));
		user.setPublic(Full.getBoolean(entity,"is_public"));
		user.setbaseDisplay(Full.getString(entity,"user_display"));
		user.setCountry(Full.getString(entity,"country"));
		user.setbaseCreation(Full.getLong(entity,"user_creation_time")*TIME_DIVIDER);
		user.setbaseBirth(Full.getLong(entity,"birth_time")*TIME_DIVIDER);
		user.setOld(Full.getStringList(entity,"old_display"));
		user.setbaseCategory(Full.getStringValueList(entity,"category").stream().map(v -> Category.valueof(v.get())).collect(Collectors.toList()));
		user.setOds(Full.getLongList(entity,"user_ods"));
		user.setBorderID(Full.getString(entity,"user_border"));
		user.setbasePoints(Full.getLong(entity,"user_points"));
		return user;
	}

	@Override
	public Map<String, Object> tomap(Entity e) {return fromdatabase(e).tomap();}
}
