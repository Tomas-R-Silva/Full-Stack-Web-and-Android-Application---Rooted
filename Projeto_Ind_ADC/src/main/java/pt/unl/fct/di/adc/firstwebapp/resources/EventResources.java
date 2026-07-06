package pt.unl.fct.di.adc.firstwebapp.resources;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import com.google.cloud.datastore.Cursor;
import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.EntityQuery;
import com.google.cloud.datastore.Key;
import com.google.cloud.datastore.LongValue;
import com.google.cloud.datastore.Query;
import com.google.cloud.datastore.QueryResults;
import com.google.cloud.datastore.StringValue;
import com.google.cloud.datastore.StructuredQuery;
import com.google.cloud.datastore.StructuredQuery.CompositeFilter;
import com.google.cloud.datastore.StructuredQuery.PropertyFilter;
import com.google.cloud.datastore.Transaction;
import com.google.cloud.datastore.Value;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import pt.unl.fct.di.adc.firstwebapp.Objects.Event;
import pt.unl.fct.di.adc.firstwebapp.Objects.Event.Status;
import pt.unl.fct.di.adc.firstwebapp.Objects.EventAtributsid;
import pt.unl.fct.di.adc.firstwebapp.Objects.EventInputInterface;
import pt.unl.fct.di.adc.firstwebapp.Objects.Token;
import pt.unl.fct.di.adc.firstwebapp.Objects.User.Role;
import pt.unl.fct.di.adc.firstwebapp.Utilities.AuthHelper;
import pt.unl.fct.di.adc.firstwebapp.Utilities.GCSUploader;
import pt.unl.fct.di.adc.firstwebapp.Utilities.ResponceBuilder;
import pt.unl.fct.di.adc.firstwebapp.error.Error;
import pt.unl.fct.di.adc.firstwebapp.error.ErrorException;
import pt.unl.fct.di.adc.firstwebapp.error.Validator;
import pt.unl.fct.di.adc.firstwebapp.model.CreateEventRequest;
import pt.unl.fct.di.adc.firstwebapp.model.EventShortUserTokenRequest;
import pt.unl.fct.di.adc.firstwebapp.model.EventTokenRequest;
import pt.unl.fct.di.adc.firstwebapp.model.ImageRequest;
import pt.unl.fct.di.adc.firstwebapp.model.ImageRequest.ImageRequestInput;
import pt.unl.fct.di.adc.firstwebapp.model.ListEventsRequest;
import pt.unl.fct.di.adc.firstwebapp.model.ListEventsRequest.ListEventsInput;
import pt.unl.fct.di.adc.firstwebapp.model.ShortUserTokenRequest;
import pt.unl.fct.di.adc.firstwebapp.model.UpdateEventRequest;

@Path("/events")
public class EventResources {

	private static final Datastore datastore = DatastoreOptions.newBuilder()
			.setProjectId("adc-final")
			.build()
			.getService();

	private static final Logger Log = Logger.getLogger(EventResources.class.getName());

	public EventResources() {}

	// -------------------------------------------------------------------------
	// POST /rest/events/create
	// -------------------------------------------------------------------------
	@POST
	@Path("/create")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response createEvent(Object obj) {
		try {
			CreateEventRequest req=AuthHelper.verifyInput(obj,CreateEventRequest.class);
			Token tokenObj = AuthHelper.verifyToken(req);

			Event event = new Event(req.getInput(),tokenObj.getUsername());

			Key key = datastore.newKeyFactory().setKind("Event").newKey(event.getEventId());
			Entity entity = Entity.newBuilder(key)
					.set("event_id", event.getEventId())
					.set("title", event.getTitle())
					.set("description", event.getDescription())
					.set("category", event.getCategory().name())
					.set("location", event.getLocation())
					.set("start_date", event.getStartDate())
					.set("duration_minutes", event.getDurationMinutes())
					.set("organizer_username", event.getOrganizerUsername())
					.set("max_attendees", event.getMaxAttendees())
					.set("min_attendees", event.getMinAttendees())
					.set("attendee_count", 0L)
					.set("is_public", event.isPublic())
					.set("status", event.getStatus().name())
					.set("created_at", event.getCreatedAt())
					.set("image_urls", new ArrayList<StringValue>())
					.set("is_accessible", event.isAccessible())
					.set("SDG", event.getSDG())
					.build();
			datastore.put(entity);
			Log.info("Event created: " + event.getEventId() + " by " + tokenObj.getUsername());
			return ok(Map.of("eventId", event.getEventId(), "message", "Event created successfully"));

		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	// -------------------------------------------------------------------------
	// POST /rest/events/get
	// -------------------------------------------------------------------------
	@POST
	@Path("/get")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getEvent(Object obj) {
		try {
			EventTokenRequest req=AuthHelper.verifyInput(obj,EventTokenRequest.class);
			Entity entity = getEventEntity(req.getInput());

			boolean isPublic = entity.getBoolean("is_public");
			if (!isPublic) {
				// Private event must be authenticated
				Token token = AuthHelper.verifyToken(req);
				String requester = token.getUsername();
				String organizer = entity.getString("organizer_username");
				Role role = token.getRole();
				if (!requester.equals(organizer) && role != Role.ADMIN && role != Role.BOFFICER) {
					// Also allow attendees to see the event
					if (!isAttending(req.getInput().getEventId(), requester))
						ErrorException.trow(9905);
				}
			}

			return ok(Map.of("event", entityToMap(entity)));

		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	// -------------------------------------------------------------------------
	// POST /rest/events/list
	// -------------------------------------------------------------------------
	@POST
	@Path("/list")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response listEvents(Object obj) {
		try {
			ListEventsRequest req=AuthHelper.verifyInput(obj,ListEventsRequest.class);
			boolean authenticated = false;
			Role requesterRole = null;
			ListEventsInput input =req.getInput();
			if (req.getToken() != null && req.getToken().getJwt() != null) {
				try {
					Token token = AuthHelper.verifyToken(req);
					authenticated = true;
					requesterRole = token.getRole();
				} catch (ErrorException ignored) {
					// Token invalid  treat as unauthenticated
				}
			}

			EntityQuery.Builder queryBuilder = Query.newEntityQueryBuilder().setKind("Event");

			// Build filters
			List<StructuredQuery.Filter> filters = new ArrayList<>();

			// Unauthenticated users see only public events
			if (!authenticated) {
				filters.add(PropertyFilter.eq("is_public", true));
			} else if (requesterRole != Role.ADMIN && requesterRole != Role.BOFFICER) {
				// Regular users see public events and their own private events
				filters.add(PropertyFilter.eq("is_public", true));
			}
			
			if (input.isAccessible() != null && input.isAccessible())
				filters.add(PropertyFilter.eq("is_accessible", input.isAccessible()));

			if (input.getCategory() != null)
				filters.add(PropertyFilter.eq("category", input.getCategory()));

			if (input.getStatus() != null)
				filters.add(PropertyFilter.eq("status", input.getStatus()));

			if (input.getOrganizerUsername() != null && !input.getOrganizerUsername().isBlank())
				filters.add(PropertyFilter.eq("organizer_username", input.getOrganizerUsername()));

			if (!filters.isEmpty()) {
				if (filters.size() == 1) {
					queryBuilder.setFilter(filters.get(0));
				} else {
					queryBuilder.setFilter(CompositeFilter.and(
							filters.get(0),
							filters.subList(1, filters.size()).toArray(new StructuredQuery.Filter[0])));
				}
			}

			queryBuilder.setLimit(input.getPageSize());

			if (input.getCursor() != null && !input.getCursor().isBlank())
				queryBuilder.setStartCursor(Cursor.fromUrlSafe(input.getCursor()));

			QueryResults<Entity> results = datastore.run(queryBuilder.build());

			List<Map<String, Object>> events = new ArrayList<>();

			List<Integer> sdg = input.getSDG();
			List<LongValue> sdglist = new ArrayList<>(sdg.size());
			for(Integer n:sdg) sdglist.add(LongValue.of(n));
			
			while (results.hasNext()) {
				Entity current = results.next();
				if(sdg!=null) {
					boolean b=false;
					List<Value<?>> list = current.getList("SDG");
					for(LongValue n:sdglist) 
						b|=list.contains(n);
					if(b)
						events.add(entityToMap(current));
				}
				else
					events.add(entityToMap(current));
			}

			Map<String, Object> response = new HashMap<>();
			response.put("events", events);
			response.put("count", events.size());
			if (results.getCursorAfter() != null)
				response.put("nextCursor", results.getCursorAfter().toUrlSafe());

			return ok(response);

		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	// -------------------------------------------------------------------------
	// POST /rest/events/update
	// -------------------------------------------------------------------------
	@POST
	@Path("/update")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response updateEvent(Object obj) {
		try {
			UpdateEventRequest req=AuthHelper.verifyInput(obj,UpdateEventRequest.class);
			Token token = AuthHelper.verifyToken(req);
			EventAtributsid input=req.getInput();
			Entity existing = getEventEntity(input);
			String organizer = existing.getString("organizer_username");

			if (!token.getUsername().equals(organizer) && token.getRole() != Role.ADMIN)
				ErrorException.trow(9905);

			if (existing.getString("status").equals(Status.CANCELLED.name()))
				ErrorException.trow(9907); // can't edit a cancelled event

			Entity.Builder builder = Entity.newBuilder(existing);

			if (input.getTitle() != null && !input.getTitle().isBlank())
				builder.set("title", input.getTitle());
			if (input.getDescription() != null && !input.getDescription().isBlank())
				builder.set("description", input.getDescription());
			if (input.getCategory() != null)
				builder.set("category", input.getCategory().toString());
			if (input.getLocation() != null && !input.getLocation().isBlank())
				builder.set("location", input.getLocation());
			if (input.getStartDatenull() != null && input.getStartDate() > 0)
				builder.set("start_date", input.getStartDate());
			if (input.getDurationMinutesnull() != null && input.getDurationMinutes() > 0)
				builder.set("duration_minutes", input.getDurationMinutes());
			if (input.getMaxAttendeesnull() != null)
				builder.set("max_attendees", input.getMaxAttendees());
			if (input.getMaxAttendeesnull() != null)
				builder.set("min_attendees", input.getMinAttendees());
			if (input.isPublicnull() != null)
				builder.set("is_public", input.isPublic());
			if (input.isAccessiblenull() != null)
				builder.set("is_accessible", input.isAccessible());
			if (input.isAccessiblenull() != null)
				builder.set("is_accessible", input.isAccessible());
			if(input.getSDGint()!= null)
				builder.set("SDG", input.getSDG());
			if (input.getCoverImageUrl() != null && !input.getCoverImageUrl().isBlank())
				builder.set("coverImageUrl", input.getCoverImageUrl());

			datastore.put(builder.build());
			return ok(Map.of("message", "Event updated successfully"));

		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	// -------------------------------------------------------------------------
	// POST /rest/events/delete
	// -------------------------------------------------------------------------
	@POST
	@Path("/delete")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response deleteEvent(Object obj) {
		try {
			EventTokenRequest req=AuthHelper.verifyInput(obj,EventTokenRequest.class);
			Token token = AuthHelper.verifyToken(req);
			Entity existing = getEventEntity(req.getInput());
			String organizer = existing.getString("organizer_username");

			if (!token.getUsername().equals(organizer) && token.getRole() != Role.ADMIN)
				ErrorException.trow(9905);

			Key key = datastore.newKeyFactory().setKind("Event").newKey(req.getInput().getEventId());
			datastore.delete(key);
			deleteAllAttendances(req.getInput().getEventId());

			return ok(Map.of("message", "Event deleted successfully"));

		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	// -------------------------------------------------------------------------
	// POST /rest/events/cancel
	// -------------------------------------------------------------------------
	@POST
	@Path("/cancel")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response cancelEvent(Object obj) {
		try {
			EventTokenRequest req=AuthHelper.verifyInput(obj,EventTokenRequest.class);
			Token token = AuthHelper.verifyToken(req);
			Entity existing = getEventEntity(req.getInput());
			String organizer = existing.getString("organizer_username");

			if (!token.getUsername().equals(organizer) && token.getRole() != Role.ADMIN)
				ErrorException.trow(9905);

			Entity updated = Entity.newBuilder(existing)
					.set("status", Status.CANCELLED.name())
					.build();
			datastore.put(updated);

			return ok(Map.of("message", "Event cancelled successfully"));

		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	// -------------------------------------------------------------------------
	// POST /rest/events/attend
	// -------------------------------------------------------------------------
	@POST
	@Path("/attend")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response attendEvent(Object obj) {
		try {
			EventTokenRequest req=AuthHelper.verifyInput(obj,EventTokenRequest.class);
			Token token = AuthHelper.verifyToken(req);
			Entity eventEntity = getEventEntity(req.getInput());

			if (eventEntity.getString("status").equals(Status.CANCELLED.name()) ||
					eventEntity.getString("status").equals(Status.COMPLETED.name()))
				ErrorException.trow(9907);

			if (!eventEntity.getBoolean("is_public"))
				ErrorException.trow(9905); //TODO private event — attend via invite (future feature)

			String username = token.getUsername();
			String attendanceId = req.getInput() + "_" + username;
			Key attendanceKey = datastore.newKeyFactory().setKind("Attendance").newKey(attendanceId);

			if (datastore.get(attendanceKey) != null)
				return ok(Map.of("message", "Already attending this event"));

			long maxAttendees = eventEntity.getLong("max_attendees");
			long currentCount = eventEntity.getLong("attendee_count");
			if (maxAttendees > 0 && currentCount >= maxAttendees)
				ErrorException.trow(9928);

			// Register attendance and increment counter
			Entity attendance = Entity.newBuilder(attendanceKey)
					.set("event_id", req.getInput().getEventId())
					.set("username", username)
					.set("joined_at", System.currentTimeMillis() / 1000L)
					.build();
			datastore.put(attendance);

			Entity updatedEvent = Entity.newBuilder(eventEntity)
					.set("attendee_count", currentCount + 1)
					.build();
			datastore.put(updatedEvent);

			return ok(Map.of("message", "Successfully registered for the event"));

		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	// -------------------------------------------------------------------------
	// POST /rest/events/unattend
	// -------------------------------------------------------------------------
	@POST
	@Path("/unattend")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response unattendEvent(Object obj) {
		try {
			EventTokenRequest req=AuthHelper.verifyInput(obj,EventTokenRequest.class);
			Token token = AuthHelper.verifyToken(req);

			Entity eventEntity = getEventEntity(req.getInput());

			String username = token.getUsername();
			String attendanceId = req.getInput() + "_" + username;
			Key attendanceKey = datastore.newKeyFactory().setKind("Attendance").newKey(attendanceId);

			if (datastore.get(attendanceKey) == null)
				return ok(Map.of("message", "Not attending this event"));

			datastore.delete(attendanceKey);

			long currentCount = eventEntity.getLong("attendee_count");
			if (currentCount > 0) {
				Entity updatedEvent = Entity.newBuilder(eventEntity)
						.set("attendee_count", currentCount - 1)
						.build();
				datastore.put(updatedEvent);
			}

			return ok(Map.of("message", "Successfully unregistered from the event"));

		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	// -------------------------------------------------------------------------
	// POST /rest/events/attendees
	// -------------------------------------------------------------------------
	@POST
	@Path("/attendees")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getAttendees(Object obj) {
		try {
			EventTokenRequest req=AuthHelper.verifyInput(obj,EventTokenRequest.class);
			Token token = AuthHelper.verifyToken(req);
			Entity eventEntity = getEventEntity(req.getInput());
			String organizer = eventEntity.getString("organizer_username");

			if (!token.getUsername().equals(organizer))
				Validator.unauthorized(token, new Role[] {Role.ADMIN, Role.BOFFICER});

			Query<Entity> query = Query.newEntityQueryBuilder()
					.setKind("Attendance")
					.setFilter(PropertyFilter.eq("event_id", req.getInput().getEventId()))
					.build();

			QueryResults<Entity> results = datastore.run(query);
			List<Map<String, Object>> attendees = new ArrayList<>();

			while (results.hasNext()) {
				Entity a = results.next();
				attendees.add(Map.of(
						"username", a.getString("username"),
						"joinedAt", a.getLong("joined_at")));
			}

			return ok(Map.of("attendees", attendees, "count", attendees.size()));

		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	// -------------------------------------------------------------------------
	// POST /rest/events/myattends
	// -------------------------------------------------------------------------
	@POST
	@Path("/myattends")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getMyAttends(Object obj) {
		try {
			ShortUserTokenRequest req=AuthHelper.verifyInput(obj,ShortUserTokenRequest.class);
			Token token = AuthHelper.verifyToken(req);
			Entity user = AuthHelper.getUser(req.getInput());

			if (!token.getUsername().equals(user.getString("user_name")))
				Validator.unauthorized(token, new Role[] {Role.ADMIN, Role.BOFFICER});

			Query<Entity> query = Query.newEntityQueryBuilder()
					.setKind("Attendance")
					.setFilter(PropertyFilter.eq("username", user.getString("user_name")))
					.build();

			QueryResults<Entity> results = datastore.run(query);
			List<Map<String, Object>> attendees = new ArrayList<>();

			while (results.hasNext()) {
				Entity a = results.next();
				attendees.add(Map.of(
						"event_id", a.getString("event_id"),
						"joinedAt", a.getLong("joined_at")));
			}

			return ok(Map.of("myattends", attendees, "count", attendees.size()));

		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	// -------------------------------------------------------------------------
	// POST /rest/events/myattends
	// -------------------------------------------------------------------------
	@POST
	@Path("/isattendee")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getIsAttendee(Object obj) {
		try {
			EventShortUserTokenRequest req=AuthHelper.verifyInput(obj,EventShortUserTokenRequest.class);
			//Token token = 
			AuthHelper.verifyToken(req);
			Entity user = AuthHelper.getUser(req.getInput());

			//if (!token.getUsername().equals(user.getString("user_name")))
			//	Validator.unauthorized(token, new Role[] {Role.ADMIN, Role.BOFFICER});

			String attendanceId = req.getInput() + "_" + user.getString("user_name");
			Key attendanceKey = datastore.newKeyFactory().setKind("Attendance").newKey(attendanceId);

			return ok(Map.of("isattendee",datastore.get(attendanceKey) == null));
		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	// -------------------------------------------------------------------------
	// POST /rest/events/uploadimage
	// -------------------------------------------------------------------------
	@POST
	@Path("/uploadimages")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response uploadImages(Object obj) {
		try {
			ImageRequest req=AuthHelper.verifyInput(obj,ImageRequest.class);
			ImageRequestInput input=req.getInput();
			Token token = AuthHelper.verifyToken(req);

			Entity eventEntity = getEventEntity(input);
			String organizer = eventEntity.getString("organizer_username");
			if (!token.getUsername().equals(organizer) && token.getRole() != Role.ADMIN)
				ErrorException.trow(9905);

			List<Value<?>> existing;
			if (eventEntity.contains("image_urls")) {
				existing = eventEntity.getList("image_urls");
			} else {
				existing = Collections.emptyList();
			}

			int slots = 5 - existing.size();
			if (slots <= 0)
				return Error.invalid_input();

			List<StringValue> updatedList = existing.stream()
					.map(v -> StringValue.of((String) v.get()))
					.collect(Collectors.toList());

			List<String> uploadedUrls = new ArrayList<>();
			List<String> toUpload = input.getImages().subList(0, Math.min(input.getImages().size(), slots));
			for (String dataUrl : toUpload) {
				// Parse Base64 data URL: "data:<type>;base64,<data>"
				String[] parts = dataUrl.split(",", 2);
				String contentType = parts[0].replace("data:", "").replace(";base64", "");
				byte[] bytes = java.util.Base64.getDecoder().decode(parts[1]);
				String imageUrl = GCSUploader.uploadImage(bytes, contentType);
				updatedList.add(StringValue.of(imageUrl));
				uploadedUrls.add(imageUrl);
			}

			Entity updated = Entity.newBuilder(eventEntity)
					.set("image_urls", updatedList)
					.build();
			datastore.put(updated);

			return ok(Map.of("imageUrls", uploadedUrls, "message", "Images uploaded successfully"));

		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	// -------------------------------------------------------------------------
	// POST /rest/events/deleteimage
	// -------------------------------------------------------------------------
	@POST
	@Path("/deleteimage")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response deleteImage(Object obj) {
		Transaction txn = datastore.newTransaction();
		try {
			ImageRequest req=AuthHelper.verifyInput(obj,ImageRequest.class);
			Token token = AuthHelper.verifyToken(req);
			ImageRequestInput input=req.getInput();
			if (input.getImages().isEmpty())
				ErrorException.trow(9906);
			Entity eventEntity = getEventEntity(input);
			String organizer = eventEntity.getString("organizer_username");


			if (!token.getUsername().equals(organizer) && token.getRole() != Role.ADMIN)
				ErrorException.trow(9905);

			List<Value<?>> existing=(eventEntity.contains("image_urls"))?eventEntity.getList("image_urls"):Collections.emptyList();

			for(String imageUrl:input.getImages()) {
				List<StringValue> updatedList = existing.stream()
						.filter(v -> !imageUrl.equals(v.get()))
						.map(v -> StringValue.of((String) v.get()))
						.collect(Collectors.toList());

				if (updatedList.size() == existing.size())
					return Error.invalid_input(); // image not found in this event

				GCSUploader.deleteImage(imageUrl);

				Entity updated = Entity.newBuilder(eventEntity)
						.set("image_urls", updatedList)
						.build();
				txn.put(updated);
			}
			txn.commit();
			return ok(Map.of("message", "Image deleted successfully"));

		} catch (Exception e) {
			txn.rollback();
			return Error.fromexception(e);
		}
	}

	// Helpers


	private Entity getEventEntity(EventInputInterface event) throws ErrorException {
		if (event.getEventId() == null || event.getEventId().isBlank())
			ErrorException.trow(9906);
		Key key = datastore.newKeyFactory().setKind("Event").newKey(event.getEventId());
		Entity entity = datastore.get(key);
		if (entity == null) ErrorException.trow(9902);
		return entity;
	}

	private boolean isAttending(String eventId, String username) {
		Key key = datastore.newKeyFactory().setKind("Attendance").newKey(eventId + "_" + username);
		return datastore.get(key) != null;
	}

	private void deleteAllAttendances(String eventId) {
		Query<Entity> query = Query.newEntityQueryBuilder()
				.setKind("Attendance")
				.setFilter(PropertyFilter.eq("event_id", eventId))
				.build();
		QueryResults<Entity> results = datastore.run(query);
		while (results.hasNext())
			datastore.delete(results.next().getKey());
	}

	private Map<String, Object> entityToMap(Entity e) {
		Map<String, Object> map = new HashMap<>();
		map.put("eventId", e.getString("event_id"));
		map.put("title", e.getString("title"));
		map.put("description", e.getString("description"));
		map.put("category", e.getString("category"));
		map.put("location", e.getString("location"));
		map.put("startDate", e.getLong("start_date"));
		map.put("durationMinutes", e.getLong("duration_minutes"));
		map.put("organizerUsername", e.getString("organizer_username"));
		map.put("maxAttendees", e.getLong("max_attendees"));
		map.put("attendeeCount", e.getLong("attendee_count"));
		map.put("isPublic", e.getBoolean("is_public"));
		map.put("status", e.getString("status"));
		map.put("createdAt", e.getLong("created_at"));
		map.put("isAccessible", e.getBoolean("is_accessible"));
		map.put("SDG", e.getList("SDG"));
		map.put("coverImageUrl", e.getString("coverImageUrl"));

		List<String> imageUrls = e.contains("image_urls")
				? e.<Value<?>>getList("image_urls").stream()
						.map(v -> (String) v.get())
						.collect(Collectors.toList())
						: Collections.emptyList();
		map.put("imageUrls", imageUrls);
		return map;
	}

	private static Response ok(Map<String, Object> data) {
		return ResponceBuilder.constructorsuccess(data);
	}
}
