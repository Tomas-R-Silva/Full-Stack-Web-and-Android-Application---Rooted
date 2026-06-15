package pt.unl.fct.di.adc.firstwebapp.resources;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;

import com.auth0.jwt.exceptions.TokenExpiredException;
import com.auth0.jwt.interfaces.DecodedJWT;
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

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import pt.unl.fct.di.adc.firstwebapp.Utilities.JWTToken;
import pt.unl.fct.di.adc.firstwebapp.Utilities.ResponceBuilder;
import pt.unl.fct.di.adc.firstwebapp.error.Error;
import pt.unl.fct.di.adc.firstwebapp.error.ErrorException;
import pt.unl.fct.di.adc.firstwebapp.model.CreateEventRequest;
import pt.unl.fct.di.adc.firstwebapp.model.Event;
import pt.unl.fct.di.adc.firstwebapp.model.Event.Status;
import pt.unl.fct.di.adc.firstwebapp.model.EventActionRequest;
import pt.unl.fct.di.adc.firstwebapp.model.ListEventsRequest;
import pt.unl.fct.di.adc.firstwebapp.model.Token;
import pt.unl.fct.di.adc.firstwebapp.model.UpdateEventRequest;
import pt.unl.fct.di.adc.firstwebapp.model.User.Role;

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
            Token token = verifyToken(req.getToken());

            Event event = new Event();
            event.setEventId(UUID.randomUUID().toString());
            event.setTitle(req.getTitle());
            event.setDescription(req.getDescription());
            event.setCategory(req.getCategory());
            event.setLocation(req.getLocation());
            event.setStartDate(req.getStartDate());
            event.setDurationMinutes(req.getDurationMinutes());
            event.setOrganizerUsername(token.getUsername());
            event.setMaxAttendees(req.getMaxAttendees());
            event.setPublic(req.isPublic());
            event.setStatus(Status.UPCOMING);
            event.setCreatedAt(System.currentTimeMillis() / 1000L);
            event.setCoverImageUrl(req.getCoverImageUrl() != null ? req.getCoverImageUrl() : "");

            if (!event.isValid()) return Error.invalid_input();

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
                    .set("attendee_count", 0L)
                    .set("is_public", event.isPublic())
                    .set("status", event.getStatus().name())
                    .set("created_at", event.getCreatedAt())
                    .set("cover_image_url", event.getCoverImageUrl())
                    .build();

            datastore.put(entity);
            Log.info("Event created: " + event.getEventId() + " by " + token.getUsername());
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
    public Response getEvent(EventActionRequest req) {
        try {
            if (req.getEventId() == null || req.getEventId().isBlank())
                return Error.invalid_input();

            Entity entity = getEventEntity(req.getEventId());

            boolean isPublic = entity.getBoolean("is_public");
            if (!isPublic) {
                // Private event must be authenticated
                Token token = verifyToken(req.getToken());
                String requester = token.getUsername();
                String organizer = entity.getString("organizer_username");
                Role role = token.getRole();
                if (!requester.equals(organizer) && role != Role.ADMIN && role != Role.BOFFICER) {
                    // Also allow attendees to see the event
                    if (!isAttending(req.getEventId(), requester))
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

            if (req.getToken() != null && req.getToken().getTokenId() != null) {
                try {
                    Token token = verifyToken(req.getToken());
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

            if (req.getCategory() != null)
                filters.add(PropertyFilter.eq("category", req.getCategory().name()));

            if (req.getStatus() != null)
                filters.add(PropertyFilter.eq("status", req.getStatus().name()));

            if (req.getOrganizerUsername() != null && !req.getOrganizerUsername().isBlank())
                filters.add(PropertyFilter.eq("organizer_username", req.getOrganizerUsername()));

            if (!filters.isEmpty()) {
                if (filters.size() == 1) {
                    queryBuilder.setFilter(filters.get(0));
                } else {
                    queryBuilder.setFilter(CompositeFilter.and(
                            filters.get(0),
                            filters.subList(1, filters.size()).toArray(new StructuredQuery.Filter[0])));
                }
            }

            queryBuilder.setLimit(req.getPageSize());

            if (req.getCursor() != null && !req.getCursor().isBlank())
                queryBuilder.setStartCursor(Cursor.fromUrlSafe(req.getCursor()));

            QueryResults<Entity> results = datastore.run(queryBuilder.build());

            List<Map<String, Object>> events = new ArrayList<>();
            while (results.hasNext())
                events.add(entityToMap(results.next()));

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
            Token token = verifyToken(req.getToken());

            if (req.getEventId() == null || req.getEventId().isBlank())
                return Error.invalid_input();

            Entity existing = getEventEntity(req.getEventId());
            String organizer = existing.getString("organizer_username");

            if (!token.getUsername().equals(organizer) && token.getRole() != Role.ADMIN)
                ErrorException.trow(9905);

            if (existing.getString("status").equals(Status.CANCELLED.name()))
                ErrorException.trow(9907); // can't edit a cancelled event

            Entity.Builder builder = Entity.newBuilder(existing);

            if (req.getTitle() != null && !req.getTitle().isBlank())
                builder.set("title", req.getTitle());
            if (req.getDescription() != null && !req.getDescription().isBlank())
                builder.set("description", req.getDescription());
            if (req.getCategory() != null)
                builder.set("category", req.getCategory().name());
            if (req.getLocation() != null && !req.getLocation().isBlank())
                builder.set("location", req.getLocation());
            if (req.getStartDate() != null && req.getStartDate() > 0)
                builder.set("start_date", req.getStartDate());
            if (req.getDurationMinutes() != null && req.getDurationMinutes() > 0)
                builder.set("duration_minutes", req.getDurationMinutes());
            if (req.getMaxAttendees() != null)
                builder.set("max_attendees", req.getMaxAttendees().longValue());
            if (req.getIsPublic() != null)
                builder.set("is_public", req.getIsPublic());
            if (req.getCoverImageUrl() != null)
                builder.set("cover_image_url", req.getCoverImageUrl());

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
    public Response deleteEvent(EventActionRequest req) {
        try {
            Token token = verifyToken(req.getToken());

            if (req.getEventId() == null || req.getEventId().isBlank())
                return Error.invalid_input();

            Entity existing = getEventEntity(req.getEventId());
            String organizer = existing.getString("organizer_username");

            if (!token.getUsername().equals(organizer) && token.getRole() != Role.ADMIN)
                ErrorException.trow(9905);

            Key key = datastore.newKeyFactory().setKind("Event").newKey(req.getEventId());
            datastore.delete(key);
            deleteAllAttendances(req.getEventId());

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
    public Response cancelEvent(EventActionRequest req) {
        try {
            Token token = verifyToken(req.getToken());

            if (req.getEventId() == null || req.getEventId().isBlank())
                return Error.invalid_input();

            Entity existing = getEventEntity(req.getEventId());
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
    public Response attendEvent(EventActionRequest req) {
        try {
            Token token = verifyToken(req.getToken());

            if (req.getEventId() == null || req.getEventId().isBlank())
                return Error.invalid_input();

            Entity eventEntity = getEventEntity(req.getEventId());

            if (eventEntity.getString("status").equals(Status.CANCELLED.name()) ||
                    eventEntity.getString("status").equals(Status.COMPLETED.name()))
                ErrorException.trow(9907);

            if (!eventEntity.getBoolean("is_public"))
                ErrorException.trow(9905); // private event — attend via invite (future feature)

            String username = token.getUsername();
            String attendanceId = req.getEventId() + "_" + username;
            Key attendanceKey = datastore.newKeyFactory().setKind("Attendance").newKey(attendanceId);

            if (datastore.get(attendanceKey) != null)
                return ok(Map.of("message", "Already attending this event"));

            long maxAttendees = eventEntity.getLong("max_attendees");
            long currentCount = eventEntity.getLong("attendee_count");
            if (maxAttendees > 0 && currentCount >= maxAttendees)
                return ok(Map.of("message", "Event is full"));

            // Register attendance and increment counter
            Entity attendance = Entity.newBuilder(attendanceKey)
                    .set("event_id", req.getEventId())
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
    public Response unattendEvent(EventActionRequest req) {
        try {
            Token token = verifyToken(req.getToken());

            if (req.getEventId() == null || req.getEventId().isBlank())
                return Error.invalid_input();

            Entity eventEntity = getEventEntity(req.getEventId());

            String username = token.getUsername();
            String attendanceId = req.getEventId() + "_" + username;
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
    public Response getAttendees(EventActionRequest req) {
        try {
            Token token = verifyToken(req.getToken());

            if (req.getEventId() == null || req.getEventId().isBlank())
                return Error.invalid_input();

            Entity eventEntity = getEventEntity(req.getEventId());
            String organizer = eventEntity.getString("organizer_username");

            if (!token.getUsername().equals(organizer) &&
                    token.getRole() != Role.ADMIN &&
                    token.getRole() != Role.BOFFICER)
                ErrorException.trow(9905);

            Query<Entity> query = Query.newEntityQueryBuilder()
                    .setKind("Attendance")
                    .setFilter(PropertyFilter.eq("event_id", req.getEventId()))
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

    // Helpers

    private Token verifyToken(Token tokenJson) throws ErrorException {
        if (tokenJson == null || tokenJson.getTokenId() == null)
            ErrorException.trow(9903);
        try {
            DecodedJWT decoded = JWTToken.verifyJWT(tokenJson.getTokenId());
            tokenJson.setUsername(decoded.getSubject());
            tokenJson.setRole(Role.valueof(decoded.getClaim("role").asString()));

            Key sessionKey = datastore.newKeyFactory().setKind("Session").newKey(decoded.getId());
            if (datastore.get(sessionKey) == null)
                ErrorException.trow(9903);

            return tokenJson;
        } catch (TokenExpiredException e) {
            try {
                String jti = JWTToken.decodeUnsafe(tokenJson.getTokenId()).getId();
                datastore.delete(datastore.newKeyFactory().setKind("Session").newKey(jti));
            } catch (Exception ignored) {}
            ErrorException.trow(9904);
            return null;
        } catch (ErrorException e) {
            throw e;
        } catch (Exception e) {
            ErrorException.trow(9903);
            return null;
        }
    }

    private Entity getEventEntity(String eventId) throws ErrorException {
        Key key = datastore.newKeyFactory().setKind("Event").newKey(eventId);
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
        map.put("coverImageUrl", e.getString("cover_image_url"));
        return map;
    }

    private static Response ok(Map<String, Object> data) {
        return ResponceBuilder.constructor("success", data);
    }
}
