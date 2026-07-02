package pt.unl.fct.di.adc.firstwebapp.Objects;

import java.util.Map;

import pt.unl.fct.di.adc.firstwebapp.Objects.Event.Category;
import pt.unl.fct.di.adc.firstwebapp.model.ModelInterface;

public class EventAtributs implements ModelInterface{

	protected String title;
	protected String description;
	protected String category;
	protected String location;
	protected Long startDate;// epoch seconds
	protected Long durationMinutes;// how long the event lasts
	protected Integer maxAttendees;// 0 = unlimited
	protected Integer minAttendees;
	protected Boolean isPublic;
	protected Boolean isAccessible;
	protected String coverImageUrl;

	public EventAtributs() {}
	
	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }

	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }

	public Category getCategory() { return Category.valueof(category); }
	public void setCategory(String category) { this.category = category; }
	public void setCategory(Category category) { this.category = category.toString(); }

	public String getLocation() { return location; }
	public void setLocation(String location) { this.location = location; }

	public long getStartDate() { return zeroifnull(startDate); }
	public Long getStartDatenull() { return startDate; }
	public void setStartDate(long startDate) { this.startDate = startDate; }

	public long getDurationMinutes() { return zeroifnull(durationMinutes); }
	public Long getDurationMinutesnull() { return durationMinutes; }
	public void setDurationMinutes(long durationMinutes) { this.durationMinutes = durationMinutes; }

	public int getMaxAttendees() { return zeroifnull(maxAttendees); }
	public Integer getMaxAttendeesnull() { return maxAttendees; }
	public void setMaxAttendees(int maxAttendees) { this.maxAttendees = maxAttendees; }

	public int getMinAttendees() { return zeroifnull(minAttendees); }
	public Integer getMinAttendeesnull() { return minAttendees; }
	public void setMinAttendees(int minAttendees) { this.minAttendees = minAttendees; }

	public boolean isPublic() { return zeroifnull(isPublic); }
	public Boolean isPublicnull() { return isPublic; }
	public void setPublic(boolean isPublic) { this.isPublic = isPublic; }
	
	public boolean isAccessible() { return zeroifnull(isAccessible); }
	public Boolean isAccessiblenull() { return isAccessible; }
	public void setAccessible(boolean isAccessible) { this.isAccessible = isAccessible; }

	public String getCoverImageUrl() { return coverImageUrl; }
	public void setCoverImageUrl(String coverImageUrl) { this.description = coverImageUrl; }
	
	private static int zeroifnull(Integer n) {
		return(n==null)?0:n;
	}
	private static long zeroifnull(Long n) {
		return(n==null)?0:n;
	}
	private static boolean zeroifnull(Boolean n) {
		return(n==null)?false:n;
	}

	@Override
	public Map<String, Object> getformat() {
		Map<String, Object> map=
				Map.of("title",ModelInterface.defaultstr,
				"description",ModelInterface.defaultstr,
				"category","MUSIC",
				"location",ModelInterface.defaultstr,
				"startDate",1234567890,
				"durationMinutes", 120,
				"maxAttendees", 100,
			   	"minAttendees", 10,
			   	"coverImageUrl","https://...",
			   	"isPublic", true);
		map.put("isAccessible",true);
		return map;
	}
}