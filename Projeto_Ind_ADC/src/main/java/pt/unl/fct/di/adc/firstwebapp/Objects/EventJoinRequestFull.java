package pt.unl.fct.di.adc.firstwebapp.Objects;

import java.util.Map;

import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.Key;

import pt.unl.fct.di.adc.firstwebapp.error.ErrorException;

public class EventJoinRequestFull implements Full{
	private static final Datastore datastore = DatastoreOptions.newBuilder()
			.setProjectId("adc-final")
			.build()
			.getService();
	private final Key key;
	private RequestStatus status;
	private String username;
	private String event;
	private String organizer;
	private long created_at;


	public enum RequestStatus {
		PENDING,JOINED,REJECTED;
		public static RequestStatus valueof(String v) {
			try{return RequestStatus.valueOf(v);}catch (Exception e) {return null;}}
	}

	public EventJoinRequestFull(Key key) {this.key=key;}

	public static EventJoinRequestFull fromdatabase(EventInputInterface event, UserFull user) {
		return fromdatabase(datastore.get(makeKey(event,user)));
	}
	
	
	public static EventJoinRequestFull fromdatabase(Entity entity) {
		if(entity==null)return null;
		EventJoinRequestFull request=new EventJoinRequestFull(entity.getKey());
		request.setUsername(Full.getString(entity, "requester"));
		request.setEvent(Full.getString(entity, "event_id"));
		request.setOrganizer(Full.getString(entity, "organizer"));
		request.setCreated(Full.getLong(entity, "created_at")*TIME_DIVIDER);
		request.setStatus(Full.getString(entity, "status"));
		return request;
	}
	// Key for a join request: one per (event, requester) so a user can't spam requests.
	public static Key makeKey(EventInputInterface event, UserFull user) {
		return datastore.newKeyFactory().setKind("EventJoinRequest").newKey(event.getEventId() + "@@@" + user.getUsername());
	}

	public static EventJoinRequestFull newrequest(EventFull event,UserFull user) throws ErrorException {
		EventJoinRequestFull request=new EventJoinRequestFull(makeKey(event,user));
		request.setUsername(user.getUsername());
		request.setEvent(event.getEventId());
		request.setOrganizer(event.getOrganizerUsername());
		request.setCreated(System.currentTimeMillis());
		request.setStatus(RequestStatus.PENDING);
		return request;
	}

	@Override
	public Map<String, Object> tomap() {
		return Map.of("event_id", Full.string(event),
				"requester", Full.string(username),
				"organizer",Full.string(organizer),
				"status", Full.string(status.name()),
				"created_at", created_at);
	}

	@Override
	public Map<String, Object> tomap(Entity e) {return fromdatabase(e).tomap();}

	@Override
	public Key getKey() {return key;}

	@Override
	public Entity toentity() {
		return Entity.newBuilder(key)
				.set("event_id", event)
				.set("requester", username)
				.set("organizer", organizer)
				.set("status", status.name())
				.set("created_at", created_at / TIME_DIVIDER)
				.build();
	}
	
	private void setUsername(String username) {this.username=username;}
	private void setEvent(String event) {this.event=event;}
	private void setOrganizer(String organizer) {this.organizer=organizer;}
	private void setCreated(long created_at) {this.created_at=created_at;}
	
	public String getRequestr() {return username;}
	public long getCreated() {return created_at;}
	
	
	public String getstringStatus() {return status.name();}
	public RequestStatus getStatus() {return status;}
	public void setStatus(RequestStatus status) {this.status=status;}
	public void setStatus(String status) {this.status=RequestStatus.valueof(status);}
	public boolean isStatus(RequestStatus status) {return this.status.equals(status);}

}
