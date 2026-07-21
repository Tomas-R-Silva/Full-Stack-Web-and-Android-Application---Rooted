package pt.unl.fct.di.adc.firstwebapp.Objects;

import java.util.List;


import pt.unl.fct.di.adc.firstwebapp.Objects.EventFull.Category;

public class EventAtributs{

	protected String title;
	protected String description;
	protected String category;
	protected String location;
	protected Double lat;
	protected Double lng;
	protected Long startDate;// epoch seconds
	protected Long durationMinutes;// how long the event lasts
	protected Long maxAttendees;// 0 = unlimited
	protected Long minAttendees;
	protected Boolean isPublic;
	protected Boolean isAccessible;
	protected List<Long> sdg;


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

	public double getLat() { return zeroifnull(lat); }
	public Double getLatnull() { return lat; }
	public void setLat(double lat) { this.lat = lat; }

	public double getLng() { return zeroifnull(lng); }
	public Double getLngnull() { return lng; }
	public void setLng(double lng) { this.lng = lng; }

	public long getStartDate() { return zeroifnull(startDate); }
	public Long getStartDatenull() { return startDate; }
	public void setStartDate(long startDate) { this.startDate = startDate; }

	public long getDurationMinutes() { return zeroifnull(durationMinutes); }
	public Long getDurationMinutesnull() { return durationMinutes; }
	public void setDurationMinutes(long durationMinutes) { this.durationMinutes = durationMinutes; }

	public long getMaxAttendees() { return zeroifnull(maxAttendees); }
	public Long getMaxAttendeesnull() { return maxAttendees; }
	public void setMaxAttendees(long maxAttendees) { this.maxAttendees = maxAttendees; }

	public long getMinAttendees() { return zeroifnull(minAttendees); }
	public Long getMinAttendeesnull() { return minAttendees; }
	public void setMinAttendees(long minAttendees) { this.minAttendees = minAttendees; }

	public boolean isPublic() { return zeroifnull(isPublic); }
	public Boolean isPublicnull() { return isPublic; }
	public void setPublic(boolean isPublic) { this.isPublic = isPublic; }

	public boolean isAccessible() { return zeroifnull(isAccessible); }
	public Boolean isAccessiblenull() { return isAccessible; }
	public void setAccessible(boolean isAccessible) { this.isAccessible = isAccessible; }

	public List<Long> getSDG() { return sdg; }
	public void setSDG(List<Long> sdg) { this.sdg = sdg; }

	private static long zeroifnull(Long n) {
		return(n==null)?0:n;
	}
	private static double zeroifnull(Double n) {
		return(n==null)?0:n;
	}
	private static boolean zeroifnull(Boolean n) {
		return(n==null)?false:n;
	}

}