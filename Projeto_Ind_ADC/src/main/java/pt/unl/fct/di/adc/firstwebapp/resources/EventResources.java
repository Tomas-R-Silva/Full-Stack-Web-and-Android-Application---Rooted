package pt.unl.fct.di.adc.firstwebapp.resources;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;

import com.google.cloud.datastore.Cursor;
import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.EntityQuery;
import com.google.cloud.datastore.Key;
import com.google.cloud.datastore.Query;
import com.google.cloud.datastore.QueryResults;
import com.google.cloud.datastore.StructuredQuery;
import com.google.cloud.datastore.StructuredQuery.CompositeFilter;
import com.google.cloud.datastore.StructuredQuery.PropertyFilter;
import com.google.cloud.datastore.Transaction;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import pt.unl.fct.di.adc.firstwebapp.Objects.AttendanceFull;
import pt.unl.fct.di.adc.firstwebapp.Objects.EventAtributsid;
import pt.unl.fct.di.adc.firstwebapp.Objects.EventFull;
import pt.unl.fct.di.adc.firstwebapp.Objects.EventFull.Status;
import pt.unl.fct.di.adc.firstwebapp.Objects.EventInputInterface;
import pt.unl.fct.di.adc.firstwebapp.Objects.EventJoinRequestFull;
import pt.unl.fct.di.adc.firstwebapp.Objects.EventJoinRequestFull.RequestStatus;
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
import pt.unl.fct.di.adc.firstwebapp.model.RespondJoinRequest;
import pt.unl.fct.di.adc.firstwebapp.model.ShortUserTokenRequest;
import pt.unl.fct.di.adc.firstwebapp.model.UpdateEventRequest;

@Path("/events")
public class EventResources {

	private static final Datastore datastore = DatastoreOptions.newBuilder().setProjectId(AuthHelper.PROJECT_ID).build().getService();

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
			EventFull event = EventFull.newevent(req.getInput(),tokenObj.getUsername());
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
			// isPublic only gates joining (/attend) anyone can view an event's details.
			EventFull entity = getEventEntity(req.getInput());
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
			ListEventsInput input =req.getInput();
			EntityQuery.Builder queryBuilder = Query.newEntityQueryBuilder().setKind("Event");

			// Build filters
			List<StructuredQuery.Filter> filters = new ArrayList<>(7);

			// The listing shows every event, public and private, to everyone. 
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


			List<Long> sdg = input.getSDG();
			boolean filterBySdg = sdg != null && !sdg.isEmpty();

			while (results.hasNext()) {
				EventFull current = EventFull.fromdatabase(results.next());
				if(filterBySdg) {
					// Keep the event if it shares AT LEAST ONE SDG with the filter.
					// b |= x means b = b | x (boolean OR-assign): b starts false and,
					// once any filter SDG is found in the event, stays true for the rest.
					boolean b=false;
					List<Long> list = current.getSDG();
					for(Long n:sdg)
						b|=list.contains(n);
					if(b)
						events.add(current.tomap());
				}
				else
					events.add(current.tomap());
			}
			return ok(Map.of("events", events,"count", events.size(),
					"nextCursor",((results.getCursorAfter() != null)? results.getCursorAfter().toUrlSafe():"")));
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

			if (!existing.isOwner(token) && token.getRole() != Role.ADMIN)
				ErrorException.trow(9905);

			if (existing.getStatus().equals(Status.CANCELLED))
				ErrorException.trow(9940); // can't edit a cancelled event

			if (input.getTitle() != null && !input.getTitle().isBlank())
				existing.setTitle(input.getTitle());
			if (input.getDescription() != null && !input.getDescription().isBlank())
				existing.setDescription(input.getDescription());
			if (input.getCategory() != null)
				existing.setCategory(input.getCategory());
			if (input.getLocation() != null && !input.getLocation().isBlank())
				existing.setLocation(input.getLocation());
			if (input.getLatnull() != null && !input.getLocation().isBlank())
				existing.setLat(input.getLat());
			if (input.getLngnull() != null && !input.getLocation().isBlank())
				existing.setLng(input.getLng());
			if (input.getStartDatenull() != null && input.getStartDate() > 0)
				existing.setStartDate(input.getStartDate());
			if (input.getDurationMinutesnull() != null && input.getDurationMinutes() > 0)
				existing.setDurationMinutes(input.getDurationMinutes());
			if (input.getMaxAttendeesnull() != null)
				existing.setMaxAttendees(input.getMaxAttendees());
			if (input.getMinAttendeesnull() != null)
				existing.setMinAttendees(input.getMinAttendees());
			if (input.isPublicnull() != null)
				existing.setPublic(input.isPublic());
			if (input.isAccessiblenull() != null)
				existing.setAccessible(input.isAccessible());
			if (input.isAccessiblenull() != null)
				existing.setAccessible(input.isAccessible());
			if(input.getSDG()!= null)
				existing.setSDG(input.getSDG());			
			datastore.update(existing.toentity());
			return ok(Map.of("message", "Event updated successfully"));

		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}
	
	@POST
	@Path("/addpartner")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response addpartner(EventShortUserTokenRequest req) {
		try {
			TokenFull token = AuthHelper.verifyToken(req);
			UserFull user = AuthHelper.getUser(req.getInput());
			EventFull event = getEventEntity(req.getInput());
			if (!user.isRole(new Role[] {Role.PARTNER}))
				ErrorException.trow(9942);
			if (!event.isOwner(token) && token.getRole() != Role.ADMIN)
				ErrorException.trow(9905);
			if (event.getStatus().equals(Status.CANCELLED))
				ErrorException.trow(9940); // can't edit a cancelled event
			if(user != null)
				event.addpartner(user);			
			datastore.update(event.toentity());
			return ok(Map.of("message", "Partner added to event"));
		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}
	
	@POST
	@Path("/removepartner")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response removepartner(EventShortUserTokenRequest req) {
		try {
			TokenFull token = AuthHelper.verifyToken(req);
			UserFull user = AuthHelper.getUser(req.getInput());
			EventFull event = getEventEntity(req.getInput());
			if (!event.isOwner(token) && token.getRole() != Role.ADMIN)
				ErrorException.trow(9905);
			if (event.getStatus().equals(Status.CANCELLED))
				ErrorException.trow(9940); // can't edit a cancelled event
			if(user != null)
				event.removepartner(user);			
			datastore.update(event.toentity());
			return ok(Map.of("message", "Partner removed to event"));
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

			if (!existing.isOwner(token) && token.getRole() != Role.ADMIN)
				ErrorException.trow(9905);

			Key key = datastore.newKeyFactory().setKind("Event").newKey(req.getInput().getEventId());
			datastore.delete(key);
			
			AuthHelper.querydelete("EventJoinRequest","event_id",existing.getEventId());
			AuthHelper.querydelete("Attendance","event_id",existing.getEventId());
			AuthHelper.querydelete("ForumPost","event_id",existing.getEventId());

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
			if (!existing.isOwner(token) && token.getRole() != Role.ADMIN)
				ErrorException.trow(9905);
			existing.setStatus(Status.CANCELLED);
			datastore.update(existing.toentity());
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
			EventFull event = getEventEntity(req.getInput());
			UserFull user = AuthHelper.getUser(token);

			if (event.isStatuss(new Status[] {Status.CANCELLED,Status.COMPLETED}))
				ErrorException.trow(9940);

			// PRIVATE event: joining needs the organizer's approval. Like following a
			// private account, the same action creates a pending request instead of joining.
			if (!event.isPublic()) {
				if (event.isOwner(token))
					ErrorException.trow(9905); // organizer can't request their own event
				if (isAttending(event, user))
					return ok(Map.of("message", "Already attending this event", "status", "JOINED"));

				EventJoinRequestFull request=EventJoinRequestFull.fromdatabase(event,user);
				if (request != null)
					return ok(Map.of("message", "Join request already exists", "status", request.getstringStatus()));
				request=EventJoinRequestFull.newrequest(event,user);
				datastore.put(request.toentity());
				return ok(Map.of("message", "Join request sent", "status", request.getstringStatus()));
			}

			// PUBLIC event: join directly.
			AttendanceFull attendance=AttendanceFull.newattendance(event,user);
			if (datastore.get(attendance.getKey()) != null)
				return ok(Map.of("message", "Already attending this event", "status", "JOINED"));

			long maxAttendees = event.getMaxAttendees();
			long currentCount = event.getAttendee();
			if (maxAttendees > 0 && currentCount >= maxAttendees)
				ErrorException.trow(9928);

			datastore.put(attendance.toentity());
			event.incAttendee();
			datastore.update(event.toentity());
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
			EventFull event = getEventEntity(req.getInput());
			UserFull user = AuthHelper.getUser(token);

			Key attendanceKey=AttendanceFull.makekey(event, user);
			if (datastore.get(attendanceKey) == null)
				return ok(Map.of("message", "Not attending this event"));

			datastore.delete(attendanceKey);

			long currentCount = event.getAttendee();
			if (currentCount > 0) {
				event.decAttendee();
				datastore.update(event.toentity());
			}

			return ok(Map.of("message", "Successfully unregistered from the event"));

		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}
	
	@POST
	@Path("/kick")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response kickEvent(EventShortUserTokenRequest req) {
		try {
			TokenFull token = AuthHelper.verifyToken(req);
			EventFull event = getEventEntity(req.getInput());
			UserFull user = AuthHelper.getUser(req.getInput());
			
			if (!event.isOwner(token) && token.getRole() != Role.ADMIN)
				ErrorException.trow(9905);
			
			Key attendanceKey=AttendanceFull.makekey(event, user);
			if (datastore.get(attendanceKey) == null)
				return ok(Map.of("message", "Not attending this event"));

			datastore.delete(attendanceKey);

			long currentCount = event.getAttendee();
			if (currentCount > 0) {
				event.decAttendee();
				datastore.update(event.toentity());
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
			EventFull event = getEventEntity(req.getInput());

			if (!event.isOwner(token))
				Validator.unauthorized(token, new Role[] {Role.ADMIN, Role.BOFFICER});

			Query<Entity> query = Query.newEntityQueryBuilder()
					.setKind("EventJoinRequest")
					.setFilter(PropertyFilter.eq("event_id", event.getEventId()))
					.build();

			QueryResults<Entity> results = datastore.run(query);
			List<Map<String, Object>> requests = new ArrayList<>();
			while (results.hasNext()) {
				EventJoinRequestFull result=EventJoinRequestFull.fromdatabase(results.next());
				requests.add(Map.of("requester",result.getRequestr(),"requestedAt",result.getCreated()));
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

			EventFull event = getEventEntity(req.getInput());
			// The requester (input.username) is the user being answered, NOT the organizer 
			UserFull requester = AuthHelper.getUser(req.getInput());

			if (event == null) ErrorException.trow(9902);

			// Only the organizer (or a moderator) can answer requests for the event.
			if (!event.isOwner(token))
				Validator.unauthorized(token, new Role[] {Role.ADMIN, Role.BOFFICER});

			EventJoinRequestFull joinRequest = EventJoinRequestFull.fromdatabase(event,requester);
			if (joinRequest == null || !joinRequest.isStatus(RequestStatus.PENDING))
				ErrorException.trow(9902); // no pending request for this user/event

			if (!input.isAccept()) {
				joinRequest.setStatus(RequestStatus.REJECTED);
				datastore.put(joinRequest.toentity());
				return ok(Map.of("message", "Join request rejected"));
			}

			// Accept: enforce capacity, register the attendance
			long maxAttendees = event.getMaxAttendees();
			long currentCount = event.getAttendee();
			if (maxAttendees > 0 && currentCount >= maxAttendees)
				ErrorException.trow(9928);

			datastore.put(AttendanceFull.newattendance(event,requester).toentity());
			event.incAttendee();
			datastore.update(event.toentity());

			// The request is resolved: once accepted the attendance is the source of truth,
			// so the pending request is deleted.
			datastore.delete(joinRequest.getKey());
			return ok(Map.of("message", "Join request accepted"));

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

			if (!eventEntity.isOwner(token))
				Validator.unauthorized(token, new Role[] {Role.ADMIN, Role.BOFFICER});

			Query<Entity> query = Query.newEntityQueryBuilder()
					.setKind("Attendance")
					.setFilter(PropertyFilter.eq("event_id", req.getInput().getEventId()))
					.build();

			QueryResults<Entity> results = datastore.run(query);
			List<Map<String, Object>> attendees = new ArrayList<>((int) eventEntity.getAttendee());

			while (results.hasNext()) 
				attendees.add(AttendanceFull.fromdatabase(results.next()).tomap());
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

			while (results.hasNext()) 
				attendees.add(AttendanceFull.fromdatabase(results.next()).tomap());

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

			Key attendanceKey = AttendanceFull.makekey(req.getInput(), user);


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

			EventFull eventEntity = getEventEntity(input);
			if (!eventEntity.isOwner(token) && token.getRole() != Role.ADMIN)
				ErrorException.trow(9905);

			List<Map<String, String>> images = eventEntity.getImageUrls();

			int slots = 5 - images.size();
			if (slots <= 0)
				return Error.invalid_input();

			List<Map<String, String>> uploaded = new ArrayList<>(Math.min(input.getImages().size(), slots));

			List<String> toUpload = input.getImages().subList(0, Math.min(input.getImages().size(), slots));
			for (String dataUrl : toUpload) {
				// Parse Base64 data URL: "data:<type>;base64,<data>"
				String[] parts = dataUrl.split(",", 2);
				String contentType = parts[0].replace("data:", "").replace(";base64", "");
				byte[] bytes = java.util.Base64.getDecoder().decode(parts[1]);
				String imageUrl = GCSUploader.uploadImage(bytes, contentType);

				String id = UUID.randomUUID().toString();
				Map<String, String> img = Map.of("id", id,"url", imageUrl);
				images.add(img);
				uploaded.add(img);
			}

			eventEntity.setImageUrls(images);
			datastore.update(eventEntity.toentity());

			return ok(Map.of("imageUrls", uploaded, "message", "Images uploaded successfully"));
		} catch (Exception e) {
			return Error.fromexception(e);
		}
	}

	// -------------------------------------------------------------------------
	// POST /rest/events/uploadimageurls   attach images that are ALREADY hosted URLs
	// -------------------------------------------------------------------------
	@POST
	@Path("/uploadimageurls")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response uploadImageUrls(ImageRequest req) {
		try {
			ImageRequestInput input = req.getInput();
			TokenFull token = AuthHelper.verifyToken(req);

			EventFull event = getEventEntity(input);
			if (!event.isOwner(token) && token.getRole() != Role.ADMIN)
				ErrorException.trow(9905);


			List<Map<String, String>> images = event.getImageUrls();

			int slots = 5 - images.size();

			if (slots <= 0)
				return Error.invalid_input();

			// Unlike /uploadimages, these are already hosted URLs, so no Base64 decode
			// or GCS upload just attach them directly (respecting the 5-image limit).
			List<Map<String, String>> added = new ArrayList<>();
			List<String> toAdd = input.getImages().subList(0, Math.min(input.getImages().size(), slots));
			for (String url : toAdd) {
				if (url == null || url.isBlank())
					continue;
				String id = UUID.randomUUID().toString();
				Map<String, String> img = Map.of("id", id, "url", url);
				images.add(img);
				added.add(img);
			}
			
			event.setImageUrls(images);
			datastore.update(event.toentity());

			return ok(Map.of("imageUrls", added, "message", "Image URLs added successfully"));
		} catch (Exception e) {return Error.fromexception(e);}
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
			List<String> idsToDelete = input.getImageIds();
			if (idsToDelete.isEmpty())
				ErrorException.trow(9906);
			EventFull eventEntity = getEventEntity(input);

			if (!eventEntity.isOwner(token) && token.getRole() != Role.ADMIN)
				ErrorException.trow(9905);

			List<Map<String, String>> images = eventEntity.getImageUrls();
			int before = images.size();
			// Remove the entries whose id was requested, collecting their URLs.
			List<String> removedUrls = new ArrayList<>();
			images.removeIf(img -> {
				if (idsToDelete.contains(img.get("id"))) {
					removedUrls.add(img.get("url"));
					return true;
				}
				return false;
			});
			if (images.size() == before)
				return Error.invalid_input(); // no matching image id in this event
			// Delete the GCS object only if no remaining entry still references that URL,
			// so removing one duplicate keeps the shared file for the others.
			for (String url : removedUrls) 
				if (!images.stream().anyMatch(img -> url.equals(img.get("url"))))
					GCSUploader.deleteImage(url);

			eventEntity.setImageUrls(images);
			txn.update(eventEntity.toentity());
			txn.commit();
			return ok(Map.of("message", "Image(s) deleted successfully"));
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

	private boolean isAttending(EventInputInterface eventId, UserFull user) {
		return datastore.get(AttendanceFull.makekey(eventId, user)) != null;
	}

	private static Response ok(Map<String, Object> data) {
		return ResponceBuilder.constructorsuccess(data);
	}
}
