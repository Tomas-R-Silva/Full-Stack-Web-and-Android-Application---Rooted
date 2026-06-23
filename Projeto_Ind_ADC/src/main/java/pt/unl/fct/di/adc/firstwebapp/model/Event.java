package pt.unl.fct.di.adc.firstwebapp.model;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import com.google.cloud.datastore.Value;

import pt.unl.fct.di.adc.firstwebapp.error.Error;
import pt.unl.fct.di.adc.firstwebapp.error.ErrorException;
import pt.unl.fct.di.adc.firstwebapp.model.User.Role;

public class Event {

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

	private String eventId;
	private String title;
	private String description;
	private String category;
	private String location;
	private long startDate;       // epoch seconds
	private long durationMinutes; // how long the event lasts
	private String organizerUsername;
	private int maxAttendees;     // 0 = unlimited
	private int minAttendees;
	private boolean isPublic;
	private Status status;
	private long createdAt;       // epoch seconds
	private List<String> imageUrls = new ArrayList<>();

	public Event() {}

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
		if(!list.isEmpty())
			Error.invalid_input(list);
	}

	public static boolean validVariable(String var){
		return var != null && !var.isBlank();
	}

	public String getEventId() { return eventId; }
	public void setEventId(String eventId) { this.eventId = eventId; }

	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }

	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }

	public Category getCategory() { return Category.valueof(category); }
	public void setCategory(String category) { this.category = category; }

	public String getLocation() { return location; }
	public void setLocation(String location) { this.location = location; }

	public long getStartDate() { return startDate; }
	public void setStartDate(long startDate) { this.startDate = startDate; }

	public long getDurationMinutes() { return durationMinutes; }
	public void setDurationMinutes(long durationMinutes) { this.durationMinutes = durationMinutes; }

	public String getOrganizerUsername() { return organizerUsername; }
	public void setOrganizerUsername(String organizerUsername) { this.organizerUsername = organizerUsername; }

	public int getMaxAttendees() { return maxAttendees; }
	public void setMaxAttendees(int maxAttendees) { this.maxAttendees = maxAttendees; }

	public boolean isPublic() { return isPublic; }
	public void setPublic(boolean isPublic) { this.isPublic = isPublic; }

	public Status getStatus() { return status; }
	public void setStatus(Status status) { this.status = status; }

	public long getCreatedAt() { return createdAt; }
	public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }

	public List<String> getImageUrls() { return imageUrls; }
	public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }

	public int getMinAttendees() { return minAttendees; }
	public void setMinAttendees(int minAttendees) { this.minAttendees = minAttendees; }
}
