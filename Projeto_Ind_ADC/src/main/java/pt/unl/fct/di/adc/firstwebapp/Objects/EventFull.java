package pt.unl.fct.di.adc.firstwebapp.Objects;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.EntityValue;
import com.google.cloud.datastore.FullEntity;
import com.google.cloud.datastore.Key;
import com.google.cloud.datastore.Value;

import pt.unl.fct.di.adc.firstwebapp.Utilities.AuthHelper;
import pt.unl.fct.di.adc.firstwebapp.error.Error;
import pt.unl.fct.di.adc.firstwebapp.error.ErrorException;

public class EventFull extends EventAtributsid implements Full,EventInputInterface {
	private static final int MIN_SDG=1;
	private static final Datastore datastore = DatastoreOptions.newBuilder().setProjectId(AuthHelper.PROJECT_ID).build().getService();

	public enum Category {
		MUSIC, SPORTS, TECH, ART, FOOD, BUSINESS, COMMUNITY, OTHER;
		public static Category valueof(String v) {try{return Category.valueOf(v);}catch (Exception e) {return null;}}
	}

	public enum Status {
		UPCOMING, ONGOING, CANCELLED, COMPLETED;
		public static Status valueof(String v) {try{return Status.valueOf(v);}catch (Exception e) {return null;}}
	}

	private String organizerUsername;
	private Status status;
	private long createdAt;  // epoch seconds
	private List<Map<String, String>> imageUrls;
	private List<String> partners;
	private String eventId;
	private long attendee;
	private final Key key;

	public EventFull(Key key) {this.key=key;}

	public void isValid() throws ErrorException{
		List<Map<String,Object>> list=new LinkedList<>();
		if(!validVariable(title))
			list.add(Error.createmap(9921));
		if(!(validVariable(description)))
			list.add(Error.createmap(9922));
		if(getCategory()==null)
			list.add(Error.createmap(9911));
		if(!(validVariable(location)))
			list.add(Error.createmap(9912));
		if(!(validVariable(organizerUsername)))
			list.add(Error.createmap(9923));
		if(startDate<=0)
			list.add(Error.createmap(9914));
		if(durationMinutes<=0)
			list.add(Error.createmap(9916));
		if(maxAttendees<0)
			list.add(Error.createmap(9917));
		if(minAttendees<0||(maxAttendees!=0&&minAttendees>maxAttendees))
			list.add(Error.createmap(9918));
		if(sdg.size()<MIN_SDG)
			list.add(Error.createmap(9938));
		
		boolean found=false;
		Iterator<Long> it=sdg.iterator();
		while(!found && it.hasNext()) found=SDGcheck(it.next());
		if(found)
			list.add(Error.createmap(9933));
		
		if(!list.isEmpty())
			Error.invalid_input(list);
	}
	public static EventFull fromdatabase(String eventid) {
		return fromdatabase(datastore.get(datastore.newKeyFactory().setKind("Event").newKey(eventid)));
	}
	
	public static EventFull fromdatabase(Entity entity) {
		if(entity==null)return null;
		EventFull event=new EventFull(entity.getKey());
		event.setEventId(Full.getString(entity, "event_id"));
		event.setTitle(Full.getString(entity,"title"));
		event.setDescription(Full.getString(entity,"description"));
		event.setCategory(Full.getString(entity,"category"));
		event.setLocation(Full.getString(entity,"location"));
		event.setLatitude(Full.getDouble(entity,"latitude"));
		event.setLongitude(Full.getDouble(entity,"longitude"));
		event.setStartDate(Full.getLong(entity,"start_date") * TIME_DIVIDER);
		event.setDurationMinutes(Full.getLong(entity,"duration_minutes"));
		event.setOrganizerUsername(Full.getString(entity,"organizer_username"));
		event.setMaxAttendees(Full.getLong(entity,"max_attendees"));
		event.setMinAttendees(Full.getLong(entity,"min_attendees"));
		event.setAttendee(Full.getLong(entity,"attendee_count"));
		event.setPublic(Full.getBoolean(entity,"is_public"));
		event.setStatus(Status.valueof(Full.getString(entity,"status")));
		event.setCreatedAt(Full.getLong(entity,"created_at") * TIME_DIVIDER);
		event.setImageUrls(readImages(entity));
		event.setpartner(Full.getStringList(entity,"partners"));
		event.setAccessible(Full.getBoolean(entity,"is_accessible"));
		event.setSDG(Full.getLongList(entity,"SDG"));
		return event;
	}

	@Override
	public Map<String, Object> tomap() {
		Map<String, Object> map = new HashMap<>();
		map.put("eventId",Full.string(this.eventId));
		map.put("title",Full.string(this.title));		
		map.put("description",Full.string(this.description));
		map.put("category", Full.string(this.category));
		map.put("location", Full.string(this.location));
		map.put("latitude", this.latitude);
		map.put("longitude", this.longitude);
		map.put("startDate", this.startDate);
		map.put("durationMinutes", this.durationMinutes);
		map.put("organizerUsername", Full.string(this.organizerUsername));
		map.put("maxAttendees", this.maxAttendees);
		map.put("attendeeCount",attendee);
		map.put("isPublic", this.isPublic);
		map.put("status", this.status.name());
		map.put("createdAt", this.createdAt);
		map.put("isAccessible", this.isAccessible);
		map.put("SDG", this.sdg);
		map.put("imageUrls", imageUrls);
		map.put("partners", partners);
		return map;
	}

	@Override
	public Entity toentity() {
		Entity entity = Entity.newBuilder(key)
				.set("event_id", this.getEventId())
				.set("title", this.getTitle())
				.set("description", this.getDescription())
				.set("category", this.getCategory().name())
				.set("location", this.getLocation())
				.set("latitude", this.getLatitude())
				.set("longitude", this.getLongitude())
				.set("start_date", this.getStartDate()/ TIME_DIVIDER)
				.set("duration_minutes", this.getDurationMinutes())
				.set("organizer_username", this.getOrganizerUsername())
				.set("max_attendees", this.getMaxAttendees())
				.set("min_attendees", this.getMinAttendees())
				.set("attendee_count", this.getAttendee())
				.set("is_public", this.isPublic())
				.set("status", this.getStatus().name())
				.set("created_at", this.getCreatedAt() / TIME_DIVIDER)
				.set("image_urls", toImageValues(imageUrls))
				.set("partners", Full.makeStringValueList(partners))
				.set("is_accessible", this.isAccessible())
				.set("SDG", Full.makeLongValueList(this.getSDGint()))
				.build();
		return entity;
	}

	public static EventFull newevent(EventAtributs input,String username) throws ErrorException {
		String ID;
		Key key;
		do {
			ID=UUID.randomUUID().toString();
			key=datastore.newKeyFactory().setKind("Event").newKey(ID);
		}while(datastore.get(key)!=null);
		EventFull event=new EventFull(key);
		event.setEventId(ID);
		event.setTitle(input.getTitle());
		event.setDescription(input.getDescription());
		event.setCategory(input.getCategory());
		event.setLocation(input.getLocation());
		event.setStartDate(input.getStartDate());
		event.setDurationMinutes(input.getDurationMinutes());
		event.setOrganizerUsername(username);
		event.setMaxAttendees(input.getMaxAttendees());
		event.setMinAttendees(input.getMinAttendees());
		event.setLatitude(input.getLatitude());
		event.setLongitude(input.getLongitude());
		event.setPublic(input.isPublic());
		event.setStatus(Status.UPCOMING);
		event.setCreatedAt(System.currentTimeMillis());
		event.setSDG(input.getSDGint());
		event.setAccessible(input.isAccessible());
		event.setpartner(Collections.emptyList());
		event.setImageUrls(Collections.emptyList());
		event.setAttendee(0);
		event.isValid();
		return event;
	}


	@Override
	public Key getKey() {return key;}
	private static final boolean SDGcheck(long n) {return n>17||n<1;}
	public static boolean validVariable(String var) {return var != null && !var.isBlank();}
	public String getOrganizerUsername() { return organizerUsername; }
	public void setOrganizerUsername(String organizerUsername) { this.organizerUsername = organizerUsername;}
	public Status getStatus() { return status; }
	public boolean isStatus(Status status) { return this.status.equals(status);}
	public boolean isStatuss(Status[] statuss) {for(Status s : statuss)if(s.equals(status))return true;return false;}
	public void setStatus(Status status) { this.status = status;}
	public long getCreatedAt() { return createdAt; }
	public void setCreatedAt(long createdAt) { this.createdAt = createdAt;}
	public long getAttendee() { return attendee; }
	public void incAttendee() { attendee++; }
	public void decAttendee() { attendee--; }
	public void setAttendee(long attendee) { this.attendee = attendee;}
	public List<Map<String, String>> getImageUrls() { return imageUrls; }
	public void setImageUrls(List<Map<String, String>> imageUrls) { this.imageUrls = imageUrls; }
	public long getEnd() { return getStartDate() + getDurationMinutes() * 60L; }
	public boolean getEnded() {return System.currentTimeMillis()>=getEnd(); }
	public boolean getStarted() {return System.currentTimeMillis()>=getStartDate(); }
	public boolean inLimit() {return (maxAttendees==0||maxAttendees>=attendee)&&(minAttendees<=attendee); }
	
	public boolean isOwner(TokenFull token) {return organizerUsername.equals(token.getUsername());}
	@Override
	public Map<String, Object> tomap(Entity e) {return fromdatabase(e).tomap();}

	public void removepartner(UserFull user) throws ErrorException {
		if(!partners.contains(user.getUsername()))
			ErrorException.trow(9935);
		partners.remove(user.getUsername());
	}

	public void setpartner(List<String> partners) {this.partners=partners;}
	
	public void addpartner(UserFull user) throws ErrorException {
		if(partners.contains(user.getUsername()))
			ErrorException.trow(9936);
		partners.remove(user.getUsername());
	}
	
	// Reads the event's images as a mutable list of { id, url } maps. Also works with the
	// legacy format where each entry was a plain URL string (id defaults to the url).
	public static List<Map<String, String>> readImages(Entity e) {
		List<Map<String, String>> images = new ArrayList<>();
		if (!e.contains("image_urls")) return images;
		for (Value<?> v : e.<Value<?>>getList("image_urls")) {
			Object raw = v.get();
			String id, url;
			if (raw instanceof FullEntity<?>) {
				FullEntity<?> fe = (FullEntity<?>) raw;
				url = fe.contains("url") ? fe.getString("url") : null;
				id = fe.contains("id") ? fe.getString("id") : url;
			} else { // legacy plain URL string
				url = (String) raw;
				id = url;
			}
			images.add(Map.of("id", id,"url", url));
		}
		return images;
	}
	
	// Converts { id, url } maps back into the Datastore list value.
	private static List<EntityValue> toImageValues(List<Map<String, String>> images) {
		List<EntityValue> list = new ArrayList<>(images.size());		
		for (Map<String, String> m : images)
			list.add(imageValue(m.get("id"), m.get("url")));
		return list;
	}
	
	// Images are stored as embedded { id, url } entities so duplicates are
	// distinguishable and can be deleted individually.
	private static EntityValue imageValue(String id, String url) {
		return EntityValue.of(FullEntity.newBuilder().set("id", id).set("url", url).build());
	}
	
}

