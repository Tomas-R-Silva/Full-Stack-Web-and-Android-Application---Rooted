package pt.unl.fct.di.adc.firstwebapp.Objects;

import java.util.Map;

import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.Key;

public class FriendFull implements Full{

	
	private Key key;
	public FriendFull() {
		// TODO Auto-generated constructor stub
	}

	private FriendFull fromdatabase(Entity entity) {
		// TODO Auto-generated method stub
		return null;
	}
	
	@Override
	public Map<String, Object> tomap() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Entity toentity() {
		// TODO Auto-generated method stub
		return null;
	}
	
	@Override
	public Key getKey() {return key;}
	@Override
	public void setKey(Key key) {this.key=key;}
	@Override
	public Entity toentity(Key key) {this.setKey(key);return toentity();}
	@Override
	public Map<String, Object> tomap(Entity e) {return fromdatabase(e).tomap();}
}
