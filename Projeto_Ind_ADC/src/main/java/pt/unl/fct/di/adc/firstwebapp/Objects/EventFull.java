package pt.unl.fct.di.adc.firstwebapp.Objects;

import java.util.Map;

public class EventFull extends Event implements Full {

	public EventFull() {
		// TODO Auto-generated constructor stub
	}

	@Override
	public Map<String, Object> tomap() {
		// TODO Auto-generated method stub
		return null;
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
				.set("start_date", this.getStartDate() / TIME_DIVIDER)
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

	public static EventFull newevent(EventAtributs input, String username) throws ErrorException {
		String ID;
		Key key;
		do {
			ID = UUID.randomUUID().toString();
			key = datastore.newKeyFactory().setKind("Event").newKey(ID);
		} while (datastore.get(key) != null);
		EventFull event = new EventFull(key);
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
	public Key getKey() {
		return key;
	}

	private static final boolean SDGcheck(long n) {
		return n > 17 || n < 1;
	}

	public static boolean validVariable(String var) {
		return var != null && !var.isBlank();
	}

	public String getOrganizerUsername() {
		return organizerUsername;
	}

	public void setOrganizerUsername(String organizerUsername) {
		this.organizerUsername = organizerUsername;
	}

	public Status getStatus() {
		return status;
	}

	public boolean isStatus(Status status) {
		return this.status.equals(status);
	}

	public boolean isStatuss(Status[] statuss) {
		for (Status s : statuss)
			if (s.equals(status))
				return true;
		return false;
	}

	public void setStatus(Status status) {
		this.status = status;
	}

	public long getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(long createdAt) {
		this.createdAt = createdAt;
	}

	public long getAttendee() {
		return attendee;
	}

	public void incAttendee() {
		attendee++;
	}

	public void decAttendee() {
		attendee--;
	}

	public void setAttendee(long attendee) {
		this.attendee = attendee;
	}

	public List<Map<String, String>> getImageUrls() {
		return imageUrls;
	}

	public void setImageUrls(List<Map<String, String>> imageUrls) {
		this.imageUrls = imageUrls;
	}

	public long getEnd() {
		return getStartDate() + getDurationMinutes() * 60L;
	}

	public boolean getEnded() {
		return System.currentTimeMillis() >= getEnd();
	}

	public boolean getStarted() {
		return System.currentTimeMillis() >= getStartDate();
	}

	public boolean inLimit() {
		return (maxAttendees == 0 || maxAttendees >= attendee) && (minAttendees <= attendee);
	}

	public boolean isOwner(TokenFull token) {
		return organizerUsername.equals(token.getUsername());
	}

	@Override
	public Map<String, Object> tomap(Entity e) {
		return fromdatabase(e).tomap();
	}

	public void removepartner(UserFull user) throws ErrorException {
		if (!partners.contains(user.getUsername()))
			ErrorException.trow(9935);
		partners.remove(user.getUsername());
	}

	public void setpartner(List<String> partners) {
		this.partners = partners;
	}

	public void addpartner(UserFull user) throws ErrorException {
		if (partners.contains(user.getUsername()))
			ErrorException.trow(9936);
		partners.remove(user.getUsername());
	}

	// Reads the event's images as a mutable list of { id, url } maps. Also works
	// with the
	// legacy format where each entry was a plain URL string (id defaults to the
	// url).
	public static List<Map<String, String>> readImages(Entity e) {
		List<Map<String, String>> images = new ArrayList<>();
		if (!e.contains("image_urls"))
			return images;
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
			images.add(Map.of("id", id, "url", url));
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
