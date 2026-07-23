package pt.unl.fct.di.adc.firstwebapp.Objects;

import java.util.Map;

import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.Key;

import pt.unl.fct.di.adc.firstwebapp.Utilities.AuthHelper;

public class AttendanceFull implements Full{
	private static final long TIME_DIVIDER = 1000L;
	private static final Datastore datastore = DatastoreOptions.newBuilder().setProjectId(AuthHelper.PROJECT_ID).build().getService();
	private final Key key;
	private String username;
	private String event;
	private long joined;
	
	public String getEvent() {return event;}
	public String getUsername() {return username;}
	
	public AttendanceFull(Key key) {this.key=key;}

	public static AttendanceFull fromdatabase(Entity entity) {
		if(entity==null)return null;
		AttendanceFull newatt=new AttendanceFull(entity.getKey());
		newatt.username=Full.getString(entity, "username");
		newatt.event=Full.getString(entity, "event_id");
		newatt.joined=Full.getLong(entity, "joined_at")*TIME_DIVIDER;
		return newatt;
	}
	
	public static AttendanceFull newattendance(EventInputInterface event,UserFull user) {
		AttendanceFull newatt=new AttendanceFull(makekey(event,user));
		newatt.username=user.getUsername();
		newatt.event=event.getEventId();
		newatt.joined=System.currentTimeMillis();
		return newatt;
	}

	@Override
	public Map<String, Object> tomap() {
		return Map.of("eventId", Full.string(event),"username", Full.string(username),"joinedAt", joined);
	}
	
	public Map<String, Object> tomapusers() {
		return Map.of("username", Full.string(username),"joinedAt", joined);
	}
	
	public Map<String, Object> tomapevents() {
		return Map.of("eventId",Full.string(event),"joinedAt", joined);
	}

	@Override
	public Entity toentity() {
		return Entity.newBuilder(key)
				.set("event_id", event)
				.set("username", username)
				.set("joined_at", joined / TIME_DIVIDER)
				.build();
	}
	
	@Override
	public Key getKey() {return key;}
	@Override
	public Map<String, Object> tomap(Entity e) {return fromdatabase(e).tomap();}
	
	public static Key makekey(EventInputInterface event,UserFull user) {
		return datastore.newKeyFactory().setKind("Attendance").newKey(format(event,user));
	}
	
	public static String format(EventInputInterface event,UserFull user) {
		return event.getEventId() + "_" + user.getUsername();
	}

}
