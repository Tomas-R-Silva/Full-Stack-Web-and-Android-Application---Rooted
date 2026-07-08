package pt.unl.fct.di.adc.firstwebapp.resources;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import com.google.cloud.datastore.Cursor;
import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.EntityQuery;
import com.google.cloud.datastore.Key;
import com.google.cloud.datastore.LongValue;
import com.google.cloud.datastore.Query;
import com.google.cloud.datastore.QueryResults;
import com.google.cloud.datastore.StructuredQuery;
import com.google.cloud.datastore.StructuredQuery.CompositeFilter;
import com.google.cloud.datastore.StructuredQuery.PropertyFilter;
import com.google.cloud.datastore.Value;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import pt.unl.fct.di.adc.firstwebapp.Objects.EventAtributsid;
import pt.unl.fct.di.adc.firstwebapp.Objects.EventFull;
import pt.unl.fct.di.adc.firstwebapp.Objects.EventFull.Status;
import pt.unl.fct.di.adc.firstwebapp.Objects.EventInputInterface;
import pt.unl.fct.di.adc.firstwebapp.Objects.TokenFull;
import pt.unl.fct.di.adc.firstwebapp.Objects.User.Role;
import pt.unl.fct.di.adc.firstwebapp.Objects.UserFull;
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
	public Response createEvent(CreateEventRequest req) {
		try {
			TokenFull tokenObj = AuthHelper.verifyToken(req);
			EventFull event = EventFull.newuser(datastore,req.getInput(),tokenObj.getUsername());
			datastore.put(event.toentity());
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
	public Response getEvent(EventTokenRequest req) {
		try {
			EventFull entity = getEventEntity(req.getInput());

			boolean isPublic = entity.isPublic();
			if (!isPublic) {
				// Private event must be authenticated
				TokenFull token = AuthHelper.verifyToken(req);
				String requester = token.getUsername();
				String organizer = entity.getOrganizerUsername();
				Role role = token.getRole();
				if (!requester.equals(organizer) && role != Role.ADMIN && role != Role.BOFFICER) {
					// Also allow attendees to see the event
					if (!isAttending(req.getInput().getEventId(), requester))
						ErrorException.trow(9905);
				}
			}

			return ok(Map.of("event", entity.tomap()));

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
	public Response listEvents(ListEventsRequest req) {
		try {
			boolean authenticated = false;
			Role requesterRole = null;
			ListEventsInput input =req.getInput();
			if (req.getToken() != null && req.getToken().getJwt() != null) {
				try {
					TokenFull token = AuthHelper.verifyToken(req);
					authenticated = true;
					requesterRole = token.getRole();
				} catch (ErrorException ignored) {
					// Token invalid  treat as unauthenticated
				}
			}
			EntityQuery.Builder queryBuilder = Query.newEntityQueryBuilder().setKind("Event");

			// Build filters
			List<StructuredQuery.Filter> filters = new ArrayList<>(7);

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

			List<Map<String, Object>> events = new LinkedList<>();

			// SDG is optional in the request: getSDG() is null when the client omits it
			// (the events page sends only pageSize + cursor). Guard against null/empty so
			// we don't NPE on sdg.size() and so "no SDG filter" means "return all events".
			List<Integer> sdg = input.getSDG();
			boolean filterBySdg = sdg != null && !sdg.isEmpty();
			List<LongValue> sdglist = new ArrayList<>(filterBySdg ? sdg.size() : 0);
			if (filterBySdg)
				for(Integer n:sdg) sdglist.add(LongValue.of(n));

			while (results.hasNext()) {
				Entity current = results.next();
				if(filterBySdg) {
					boolean b=false;
					List<Value<?>> list = current.getList("SDG");
					for(LongValue n:sdglist)
						b|=list.contains(n);
					if(b)
						events.add(EventFull.fromdatabase(current).tomap());
				}
				else
					events.add(EventFull.fromdatabase(current).tomap());
			}

			Map<String, Object> response = Map.of("events", events,"count", events.size());

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
	public Response updateEvent(UpdateEventRequest req) {
		try {
			TokenFull token = AuthHelper.verifyToken(req);
			EventAtributsid input=req.getInput();
			EventFull existing = getEventEntity(input);
			String organizer = existing.getOrganizerUsername();

			if (!token.getUsername().equals(organizer) && token.getRole() != Role.ADMIN)
				ErrorException.trow(9905);

			if (existing.getStatus().equals(Status.CANCELLED))
				ErrorException.trow(9907); // can't edit a cancelled event

			if (input.getTitle() != null && !input.getTitle().isBlank())
				existing.setTitle(input.getTitle());
			if (input.getDescription() != null && !input.getDescription().isBlank())
				existing.setDescription(input.getDescription());
			if (input.getCategory() != null)
				existing.setCategory(input.getCategory());
			if (input.getLocation() != null && !input.getLocation().isBlank())
				existing.setLocation(input.getLocation());
			if (input.getStartDatenull() != null && input.getStartDate() > 0)
				existing.setStartDate(input.getStartDate());
			if (input.getDurationMinutesnull() != null && input.getDurationMinutes() > 0)
				existing.setDurationMinutes(input.getDurationMinutes());
			if (input.getMaxAttendeesnull() != null)
				existing.setMaxAttendees(input.getMaxAttendees());
			if (input.getMaxAttendeesnull() != null)
				existing.setMinAttendees(input.getMinAttendees());
			if (input.isPublicnull() != null)
				existing.setPublic(input.isPublic());
			if (input.isAccessiblenull() != null)
				existing.setAccessible(input.isAccessible());
			if (input.isAccessiblenull() != null)
				existing.setAccessible(input.isAccessible());
			if(input.getSDGint()!= null)
				existing.setSDG(input.getSDGint());			
			datastore.put(existing.toentity());
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
	public Response deleteEvent(EventTokenRequest req) {
		try {
			TokenFull token = AuthHelper.verifyToken(req);
			EventFull existing = getEventEntity(req.getInput());
			String organizer = existing.getOrganizerUsername();

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
	public Response cancelEvent(EventTokenRequest req) {
		try {
			TokenFull token = AuthHelper.verifyToken(req);
			EventFull existing = getEventEntity(req.getInput());
			String organizer = existing.getOrganizerUsername();
			if (!token.getUsername().equals(organizer) && token.getRole() != Role.ADMIN)
				ErrorException.trow(9905);
			existing.setStatus(Status.CANCELLED);
			datastore.put(existing.toentity());
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
	public Response attendEvent(EventTokenRequest req) {
		try {
			TokenFull token = AuthHelper.verifyToken(req);
			EventFull eventEntity = getEventEntity(req.getInput());

			if (eventEntity.isStatus(Status.CANCELLED) ||eventEntity.isStatus(Status.COMPLETED))
				ErrorException.trow(9907);

			if (!eventEntity.isPublic())
				ErrorException.trow(9905); //TODO private event — attend via invite (future feature)

			String username = token.getUsername();
			String attendanceId = req.getInput() + "_" + username;
			Key attendanceKey = datastore.newKeyFactory().setKind("Attendance").newKey(attendanceId);

			if (datastore.get(attendanceKey) != null)
				return ok(Map.of("message", "Already attending this event"));

			long maxAttendees = eventEntity.getMaxAttendees();
			long currentCount = eventEntity.getAttendee();
			if (maxAttendees > 0 && currentCount >= maxAttendees)
				ErrorException.trow(9928);

			// Register attendance and increment counter
			Entity attendance = Entity.newBuilder(attendanceKey)
					.set("event_id", req.getInput().getEventId())
					.set("username", username)
					.set("joined_at", System.currentTimeMillis() / 1000L)
					.build();
			datastore.put(attendance);
			eventEntity.incAttendee();
			datastore.put(eventEntity.toentity());
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
	public Response unattendEvent(EventTokenRequest req) {
		try {
			TokenFull token = AuthHelper.verifyToken(req);

			EventFull eventEntity = getEventEntity(req.getInput());

			String username = token.getUsername();
			String attendanceId = req.getInput() + "_" + username;
			Key attendanceKey = datastore.newKeyFactory().setKind("Attendance").newKey(attendanceId);

			if (datastore.get(attendanceKey) == null)
				return ok(Map.of("message", "Not attending this event"));

			datastore.delete(attendanceKey);

			long currentCount = eventEntity.getAttendee();
			if (currentCount > 0) {
				eventEntity.decAttendee();
				datastore.put(eventEntity.toentity());
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
	public Response getAttendees(EventTokenRequest req) {
		try {
			TokenFull token = AuthHelper.verifyToken(req);
			EventFull eventEntity = getEventEntity(req.getInput());
			String organizer = eventEntity.getOrganizerUsername();

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
	public Response getMyAttends(ShortUserTokenRequest req) {
		try {
			TokenFull token = AuthHelper.verifyToken(req);
			UserFull user = AuthHelper.getUser(req.getInput());

			if (!user.isme(token))
				Validator.unauthorized(token, new Role[] {Role.ADMIN, Role.BOFFICER});

			Query<Entity> query = Query.newEntityQueryBuilder()
					.setKind("Attendance")
					.setFilter(PropertyFilter.eq("username", user.getUsername()))
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
	public Response getIsAttendee(EventShortUserTokenRequest req) {
		try {
			//Token token = 
			AuthHelper.verifyToken(req);
			UserFull user = AuthHelper.getUser(req.getInput());

			//if (!token.getUsername().equals(user.getString("user_name")))
			//	Validator.unauthorized(token, new Role[] {Role.ADMIN, Role.BOFFICER});

			String attendanceId = req.getInput() + "_" + user.getUsername();
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
	public Response uploadImages(ImageRequest req) {
		try {
			ImageRequestInput input=req.getInput();
			TokenFull token = AuthHelper.verifyToken(req);

			EventFull eventEntity = getEventEntity(input);
			String organizer = eventEntity.getOrganizerUsername();
			if (!token.getUsername().equals(organizer) && token.getRole() != Role.ADMIN)
				ErrorException.trow(9905);

			List<String> existing=eventEntity.getImageUrls();

			int slots = 5 - existing.size();
			if (slots <= 0)
				return Error.invalid_input();
			List<String> uploadedUrls=new ArrayList<>(Math.min(input.getImages().size(), slots));
			List<String> toUpload = input.getImages().subList(0, Math.min(input.getImages().size(), slots));
			for (String dataUrl : toUpload) {
				// Parse Base64 data URL: "data:<type>;base64,<data>"
				String[] parts = dataUrl.split(",", 2);
				String contentType = parts[0].replace("data:", "").replace(";base64", "");
				byte[] bytes = java.util.Base64.getDecoder().decode(parts[1]);
				String imageUrl = GCSUploader.uploadImage(bytes, contentType);
				existing.add(imageUrl);
				uploadedUrls.add(imageUrl);
			}

			eventEntity.setImageUrls(existing);
			datastore.put(eventEntity.toentity());
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
	public Response deleteImage(ImageRequest req) {
		try {
			TokenFull token = AuthHelper.verifyToken(req);
			ImageRequestInput input=req.getInput();
			if (input.getImages().isEmpty())
				ErrorException.trow(9906);
			EventFull eventEntity = getEventEntity(input);
			String organizer = eventEntity.getOrganizerUsername();

			if (!token.getUsername().equals(organizer) && token.getRole() != Role.ADMIN)
				ErrorException.trow(9905);
			
			List<String> existing = eventEntity.getImageUrls();
			for(String imageUrl:input.getImages()) 
				if(existing.contains(imageUrl)) {
					existing.remove(imageUrl);
					GCSUploader.deleteImage(imageUrl);
				}
			eventEntity.setImageUrls(existing);
			datastore.put(eventEntity.toentity());
			return ok(Map.of("message", "Image deleted successfully"));

		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	// Helpers


	private EventFull getEventEntity(EventInputInterface event) throws ErrorException {
		if (event.getEventId() == null || event.getEventId().isBlank())
			ErrorException.trow(9906);
		Key key = datastore.newKeyFactory().setKind("Event").newKey(event.getEventId());
		Entity entity = datastore.get(key);
		if (entity == null) ErrorException.trow(9902);
		return EventFull.fromdatabase(entity);
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

	private static Response ok(Map<String, Object> data) {
		return ResponceBuilder.constructorsuccess(data);
	}
}
