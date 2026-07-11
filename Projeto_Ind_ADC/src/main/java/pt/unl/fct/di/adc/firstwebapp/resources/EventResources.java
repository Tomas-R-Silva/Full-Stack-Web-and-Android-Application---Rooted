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
import pt.unl.fct.di.adc.firstwebapp.Objects.TokenFull;
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
import pt.unl.fct.di.adc.firstwebapp.model.RespondJoinRequest;
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
	public Response getEvent(EventTokenRequest req) {
		try {
			Entity entity = getEventEntity(req.getInput());

			boolean isPublic = entity.getBoolean("is_public");
			if (!isPublic) {
				// Private event must be authenticated
				TokenFull token = AuthHelper.verifyToken(req);
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

			List<Map<String, Object>> events = new ArrayList<>();

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
					List<Value<?>> list = current.contains(null)?current.getList("SDG"):new ArrayList<>(0);
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
	public Response updateEvent(UpdateEventRequest req) {
		try {
			TokenFull token = AuthHelper.verifyToken(req);
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
	public Response deleteEvent(EventTokenRequest req) {
		try {
			TokenFull token = AuthHelper.verifyToken(req);
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
	public Response cancelEvent(EventTokenRequest req) {
		try {
			TokenFull token = AuthHelper.verifyToken(req);
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
	public Response attendEvent(EventTokenRequest req) {
		try {
			TokenFull token = AuthHelper.verifyToken(req);
			Entity event = getEventEntity(req.getInput());
			String username = token.getUsername();
			String eventId = req.getInput().getEventId();

			String status = event.getString("status");
			if (status.equals(Status.CANCELLED.name()) || status.equals(Status.COMPLETED.name()))
				ErrorException.trow(9907);

			// PRIVATE event: joining needs the organizer's approval. Like following a
			// private account, the same action creates a pending request instead of joining.
			if (!event.getBoolean("is_public")) {
				if (username.equals(event.getString("organizer_username")))
					ErrorException.trow(9905); // organizer can't request their own event
				if (isAttending(eventId, username))
					return ok(Map.of("message", "Already attending this event", "status", "JOINED"));

				Key reqKey = joinRequestKey(eventId, username);
				Entity existing = datastore.get(reqKey);
				if (existing != null && "PENDING".equals(existing.getString("status")))
					return ok(Map.of("message", "Join request already pending", "status", "PENDING"));

				Entity joinRequest = Entity.newBuilder(reqKey)
						.set("event_id", eventId)
						.set("requester", username)
						.set("organizer", event.getString("organizer_username"))
						.set("status", "PENDING")
						.set("created_at", System.currentTimeMillis() / 1000L)
						.build();
				datastore.put(joinRequest);
				return ok(Map.of("message", "Join request sent", "status", "PENDING"));
			}

			// PUBLIC event: join directly.
			Key attendanceKey = datastore.newKeyFactory().setKind("Attendance").newKey(eventId + "_" + username);
			if (datastore.get(attendanceKey) != null)
				return ok(Map.of("message", "Already attending this event", "status", "JOINED"));

			long maxAttendees = event.getLong("max_attendees");
			long currentCount = event.getLong("attendee_count");
			if (maxAttendees > 0 && currentCount >= maxAttendees)
				ErrorException.trow(9928);

			Entity attendance = Entity.newBuilder(attendanceKey)
					.set("event_id", eventId)
					.set("username", username)
					.set("joined_at", System.currentTimeMillis() / 1000L)
					.build();
			datastore.put(attendance);
			datastore.put(Entity.newBuilder(event).set("attendee_count", currentCount + 1).build());

			return ok(Map.of("message", "Successfully registered for the event", "status", "JOINED"));

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

			Entity eventEntity = getEventEntity(req.getInput());

			String username = token.getUsername();
			Key attendanceKey = datastore.newKeyFactory().setKind("Attendance")
					.newKey(req.getInput().getEventId() + "_" + username);

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
	// POST /rest/events/joinrequests  — organizer lists the PENDING join requests
	// -------------------------------------------------------------------------
	@POST
	@Path("/joinrequests")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response listJoinRequests(EventTokenRequest req) {
		try {
			TokenFull token = AuthHelper.verifyToken(req);
			Entity event = getEventEntity(req.getInput());

			if (!token.getUsername().equals(event.getString("organizer_username")))
				Validator.unauthorized(token, new Role[] {Role.ADMIN, Role.BOFFICER});

			Query<Entity> query = Query.newEntityQueryBuilder()
					.setKind("EventJoinRequest")
					.setFilter(PropertyFilter.eq("event_id", req.getInput().getEventId()))
					.build();

			QueryResults<Entity> results = datastore.run(query);
			List<Map<String, Object>> requests = new ArrayList<>();
			while (results.hasNext()) {
				Entity r = results.next();
				Map<String, Object> m = new HashMap<>();
				m.put("requester", r.getString("requester"));
				m.put("requestedAt", r.getLong("created_at"));
				requests.add(m);
			}

			return ok(Map.of("requests", requests, "count", requests.size()));

		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	// -------------------------------------------------------------------------
	// POST /rest/events/respondjoin  — organizer accepts/rejects a join request
	// -------------------------------------------------------------------------
	@POST
	@Path("/respondjoin")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response respondJoin(RespondJoinRequest req) {
		try {
			TokenFull token = AuthHelper.verifyToken(req);
			RespondJoinRequest.RespondJoinInput input = req.getInput();
			String eventId = input.getEventId();
			String requester = input.getUsername();

			if (eventId == null || eventId.isBlank() || requester == null || requester.isBlank())
				ErrorException.trow(9906);

			Key eventKey = datastore.newKeyFactory().setKind("Event").newKey(eventId);
			Entity event = datastore.get(eventKey);
			if (event == null) ErrorException.trow(9902);

			// Only the organizer (or a moderator) can answer requests for the event.
			if (!token.getUsername().equals(event.getString("organizer_username")))
				Validator.unauthorized(token, new Role[] {Role.ADMIN, Role.BOFFICER});

			Key reqKey = joinRequestKey(eventId, requester);
			Entity joinRequest = datastore.get(reqKey);
			if (joinRequest == null || !"PENDING".equals(joinRequest.getString("status")))
				ErrorException.trow(9902); // no pending request for this user/event

			if (!input.isAccept()) {
				datastore.put(Entity.newBuilder(joinRequest).set("status", "REJECTED").build());
				return ok(Map.of("message", "Join request rejected"));
			}

			// Accept: enforce capacity, register the attendance
			long max = event.getLong("max_attendees");
			long count = event.getLong("attendee_count");
			if (max > 0 && count >= max)
				ErrorException.trow(9928);

			Key attendanceKey = datastore.newKeyFactory().setKind("Attendance")
					.newKey(eventId + "_" + requester);
			if (datastore.get(attendanceKey) == null) {
				Entity attendance = Entity.newBuilder(attendanceKey)
						.set("event_id", eventId)
						.set("username", requester)
						.set("joined_at", System.currentTimeMillis() / 1000L)
						.build();
				datastore.put(attendance);
				datastore.put(Entity.newBuilder(event).set("attendee_count", count + 1).build());
			}

			// The request is resolved: once accepted the attendance is the source of truth,
			// so the pending request is deleted.
			datastore.delete(reqKey);
			return ok(Map.of("message", "Join request accepted"));

		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	// Key for a join request: one per (event, requester) so a user can't spam requests.
	private Key joinRequestKey(String eventId, String requester) {
		return datastore.newKeyFactory().setKind("EventJoinRequest").newKey(eventId + "@@@" + requester);
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
	public Response getMyAttends(ShortUserTokenRequest req) {
		try {
			TokenFull token = AuthHelper.verifyToken(req);
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
	public Response getIsAttendee(EventShortUserTokenRequest req) {
		try {
			//Token token = 
			AuthHelper.verifyToken(req);
			Entity user = AuthHelper.getUser(req.getInput());

			//if (!token.getUsername().equals(user.getString("user_name")))
			//	Validator.unauthorized(token, new Role[] {Role.ADMIN, Role.BOFFICER});

			Key attendanceKey = datastore.newKeyFactory().setKind("Attendance")
					.newKey(req.getInput().getEventId() + "_" + user.getString("user_name"));

			// isattendee is true when an Attendance exists (get != null).
			return ok(Map.of("isattendee", datastore.get(attendanceKey) != null));
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
	public Response deleteImage(ImageRequest req) {
		Transaction txn = datastore.newTransaction();
		try {
			TokenFull token = AuthHelper.verifyToken(req);
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
		map.put("eventId", e.contains("event_id")?e.getString("event_id"):null);
		map.put("title", e.contains("title")?e.getString("title"):null);
		map.put("description", e.contains("description")?e.getString("description"):null);
		map.put("category", e.contains("category")?e.getString("category"):null);
		map.put("location", e.contains("location")?e.getString("location"):null);
		map.put("startDate", e.contains("start_date")?e.getLong("start_date"):null);
		map.put("durationMinutes", e.contains("duration_minutes")?e.getLong("duration_minutes"):null);
		map.put("organizerUsername", e.contains("organizer_username")?e.getString("organizer_username"):null);
		map.put("maxAttendees", e.contains("max_attendees")?e.getLong("max_attendees"):null);
		map.put("attendeeCount",e.contains("attendee_count")?e.getLong("attendee_count"):null);
		map.put("isPublic", e.contains("is_public")?e.getBoolean("is_public"):null);
		map.put("status", e.contains("status")?e.getString("status"):null);
		map.put("createdAt", e.contains("created_at")?e.getLong("created_at"):null);
		map.put("isAccessible", e.contains("is_accessible")?e.getBoolean("is_accessible"):null);
		List<Integer> sdg = new ArrayList<>();
		if (e.contains("SDG")) {
			for (Value<?> v : e.<Value<?>>getList("SDG")) {
				Long number = (Long) v.get();
				sdg.add(number.intValue());
			}
		}
		map.put("SDG", sdg);

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
