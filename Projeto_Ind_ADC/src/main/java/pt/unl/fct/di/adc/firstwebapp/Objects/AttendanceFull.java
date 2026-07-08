package pt.unl.fct.di.adc.firstwebapp.Objects;

import java.util.Map;

import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.Key;

public class AttendanceFull implements Full{

	private final Key key;
	
	public AttendanceFull(Key key) {this.key=key;}

	public static AttendanceFull fromdatabase(Entity entity) {

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
	public Map<String, Object> tomap(Entity e) {return fromdatabase(e).tomap();}

}
