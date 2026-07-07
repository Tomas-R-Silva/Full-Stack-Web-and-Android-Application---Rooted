package pt.unl.fct.di.adc.firstwebapp.Objects;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import pt.unl.fct.di.adc.firstwebapp.error.Error;
import pt.unl.fct.di.adc.firstwebapp.error.ErrorException;

public class Event extends EventAtributsid {

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
	private List<String> imageUrls = new ArrayList<>();

	public Event() {}

	public Event(EventAtributs input,String username) throws ErrorException {
		this.setEventId(UUID.randomUUID().toString());
		this.setTitle(input.getTitle());
		this.setDescription(input.getDescription());
		this.setCategory(input.getCategory());
		this.setLocation(input.getLocation());
		this.setStartDate(input.getStartDate());
		this.setDurationMinutes(input.getDurationMinutes());
		this.setOrganizerUsername(username);
		this.setMaxAttendees(input.getMaxAttendees());
		this.setMinAttendees(input.getMinAttendees());
		this.setPublic(input.isPublic());
		this.setStatus(Status.UPCOMING);
		this.setCreatedAt(System.currentTimeMillis() / 1000L);
		this.setSDG(input.getSDGint());
		this.setAccessible(input.isAccessible());
		isValid();
	}

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
		Iterator<Integer> it=sdg.iterator();
		while(!found && it.hasNext()) found=SDGcheck(it.next());
		if(found)
			list.add(Error.createmap(9933));
		if(!list.isEmpty())
			Error.invalid_input(list);
	}

	private static final boolean SDGcheck(int n) {return n>17||n<1;}

	public static boolean validVariable(String var){
		return var != null && !var.isBlank();
	}

	public String getOrganizerUsername() { return organizerUsername; }
	public void setOrganizerUsername(String organizerUsername) { this.organizerUsername = organizerUsername; }

	public Status getStatus() { return status; }
	public void setStatus(Status status) { this.status = status; }

	public long getCreatedAt() { return createdAt; }
	public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }

	public List<String> getImageUrls() { return imageUrls; }
	public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
}
