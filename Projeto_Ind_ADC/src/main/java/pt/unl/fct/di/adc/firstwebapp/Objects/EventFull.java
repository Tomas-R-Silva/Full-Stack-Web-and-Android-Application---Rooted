package pt.unl.fct.di.adc.firstwebapp.Objects;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.Key;
import com.google.cloud.datastore.StringValue;
import com.google.cloud.datastore.Value;

import pt.unl.fct.di.adc.firstwebapp.error.Error;
import pt.unl.fct.di.adc.firstwebapp.error.ErrorException;

public class EventFull extends EventAtributsid implements Full,EventInputInterface {

	
	public enum Category {
		MUSIC, SPORTS, TECH, ART, FOOD, BUSINESS, COMMUNITY, OTHER;
		public static Category valueof(String v) {
			try{return Category.valueOf(v);}catch (Exception e) {return null;}}
	}

	public enum Status {
		UPCOMING, ONGOING, CANCELLED, COMPLETED;
		public static Status valueof(String v) {
			try{return Status.valueOf(v);}catch (Exception e) {return null;}}
	}

	private String organizerUsername;
	private Status status;
	private long createdAt;  // epoch seconds
	private List<String> imageUrls;
	private String eventId;
	private int attendee;
	private Key key;
	
	public EventFull() {}
		
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
		boolean found=false;
		Iterator<Long> it=sdg.iterator();
		while(!found && it.hasNext()) found=SDGcheck(it.next());
		if(found)
			list.add(Error.createmap(9933));
		if(!list.isEmpty())
			Error.invalid_input(list);
	}

	public static EventFull fromdatabase(Entity entity) {

		
		List<String> imageUrls = e.contains("image_urls")? e.<StringValue>getList("image_urls").stream()
						.map(v -> (String) v.get())
						.collect(Collectors.toList())
						: Collections.emptyList();
	}

	@Override
	public Map<String, Object> tomap() {
		Map<String, Object> map = Map.of();
		map.put("eventId",this.eventId);
		map.put("title",this.title);		
		map.put("description",this.description);
		map.put("category", this.category);
		map.put("location", this.location);
		map.put("startDate", this.startDate);
		map.put("durationMinutes", this.durationMinutes);
		map.put("organizerUsername", this.organizerUsername);
		map.put("maxAttendees", this.maxAttendees);
		map.put("attendeeCount",attendee);
		map.put("isPublic", this.isPublic);
		map.put("status", this.status.name());
		map.put("createdAt", this.createdAt);
		map.put("isAccessible", this.isAccessible);
		map.put("SDG", this.sdg);
		map.put("imageUrls", imageUrls);
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
				.set("start_date", this.getStartDate())
				.set("duration_minutes", this.getDurationMinutes())
				.set("organizer_username", this.getOrganizerUsername())
				.set("max_attendees", this.getMaxAttendees())
				.set("min_attendees", this.getMinAttendees())
				.set("attendee_count", this.getAttendee())
				.set("is_public", this.isPublic())
				.set("status", this.getStatus().name())
				.set("created_at", this.getCreatedAt() / TIME_DIVIDER)
				.set("image_urls", Full.makeStringValueList(imageUrls))
				.set("is_accessible", this.isAccessible())
				.set("SDG", this.getSDG())
				.build();
		return entity;
	}
	
	public static EventFull newuser(EventAtributs input,String username) throws ErrorException {
		EventFull event=new EventFull();
		event.setEventId(UUID.randomUUID().toString());
		event.setTitle(input.getTitle());
		event.setDescription(input.getDescription());
		event.setCategory(input.getCategory());
		event.setLocation(input.getLocation());
		event.setStartDate(input.getStartDate());
		event.setDurationMinutes(input.getDurationMinutes());
		event.setOrganizerUsername(username);
		event.setMaxAttendees(input.getMaxAttendees());
		event.setMinAttendees(input.getMinAttendees());
		event.setPublic(input.isPublic());
		event.setStatus(Status.UPCOMING);
		event.setCreatedAt(System.currentTimeMillis());
		event.setSDG(input.getSDGint());
		event.setAccessible(input.isAccessible());
		event.setImageUrls(new ArrayList<String>(0));
		event.setAttendee(0);
		event.isValid();
		return event;
	}
	
	@Override
	public Key getKey() {return key;}
	@Override
	public void setKey(Key key) {this.key=key;}
	@Override
	public Entity toentity(Key key) {this.setKey(key);return toentity();}
	private static final boolean SDGcheck(long n) {return n>17||n<1;}
	public static boolean validVariable(String var) {return var != null && !var.isBlank();}
	public String getOrganizerUsername() { return organizerUsername; }
	public void setOrganizerUsername(String organizerUsername) { this.organizerUsername = organizerUsername;}
	public Status getStatus() { return status; }
	public void setStatus(Status status) { this.status = status;}
	public long getCreatedAt() { return createdAt; }
	public void setCreatedAt(long createdAt) { this.createdAt = createdAt;}
	public long getAttendee() { return attendee; }
	public void setAttendee(int attendee) { this.attendee = attendee;}
	public List<String> getImageUrls() { return imageUrls; }
	public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
	@Override
	public Map<String, Object> tomap(Entity e) {return fromdatabase(e).tomap();}
}
