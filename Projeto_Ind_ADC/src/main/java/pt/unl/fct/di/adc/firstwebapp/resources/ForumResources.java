package pt.unl.fct.di.adc.firstwebapp.resources;

import java.util.ArrayList;
import java.util.HashMap;
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
import com.google.cloud.datastore.StructuredQuery.OrderBy;
import com.google.cloud.datastore.StructuredQuery.PropertyFilter;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import pt.unl.fct.di.adc.firstwebapp.Utilities.AuthHelper;
import pt.unl.fct.di.adc.firstwebapp.Utilities.ResponceBuilder;
import pt.unl.fct.di.adc.firstwebapp.error.Error;
import pt.unl.fct.di.adc.firstwebapp.error.ErrorException;
import pt.unl.fct.di.adc.firstwebapp.model.DeletePostRequest;
import pt.unl.fct.di.adc.firstwebapp.model.Event.Status;
import pt.unl.fct.di.adc.firstwebapp.model.ForumPost;
import pt.unl.fct.di.adc.firstwebapp.model.ListForumRequest;
import pt.unl.fct.di.adc.firstwebapp.model.PostMessageRequest;
import pt.unl.fct.di.adc.firstwebapp.model.Token;
import pt.unl.fct.di.adc.firstwebapp.model.User.Role;

@Path("/forum")
public class ForumResources {

    private static final Datastore datastore = DatastoreOptions.newBuilder()
            .setProjectId("adc-final")
            .build()
            .getService();

    private static final Logger Log = Logger.getLogger(ForumResources.class.getName());

    private static final int DEFAULT_PAGE_SIZE = 50;
    private static final int MAX_PAGE_SIZE = 100;
    private static final int DELETE_BATCH = 500;

    public ForumResources() {}

    // -------------------------------------------------------------------------
    // POST /rest/forum/post
    // -------------------------------------------------------------------------
    @POST
    @Path("/post")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response postMessage(PostMessageRequest req) {
        try {
            Token token = AuthHelper.verifyToken(req.getToken());

            if (req.getEventId() == null || req.getEventId().isBlank())
                return Error.invalid_input();

            Entity eventEntity = getEventEntity(req.getEventId());

            String status = eventEntity.getString("status");
            if (status.equals(Status.CANCELLED.name()) || status.equals(Status.COMPLETED.name()))
                ErrorException.trow(9931); // event is closed, forum no longer accepts posts

            ForumPost post = new ForumPost();
            post.setPostId(UUID.randomUUID().toString());
            post.setEventId(req.getEventId());
            post.setAuthorUsername(token.getUsername());
            post.setText(req.getText());
            post.setParentPostId(req.getParentPostId());
            post.setCreatedAt(System.currentTimeMillis() / 1000L);

            post.isValid();

            Key key = datastore.newKeyFactory().setKind("ForumPost").newKey(post.getPostId());
            Entity.Builder builder = Entity.newBuilder(key)
                    .set("post_id", post.getPostId())
                    .set("event_id", post.getEventId())
                    .set("author_username", post.getAuthorUsername())
                    .set("text", post.getText())
                    .set("created_at", post.getCreatedAt());
            if (post.getParentPostId() != null && !post.getParentPostId().isBlank())
                builder.set("parent_post_id", post.getParentPostId());

            datastore.put(builder.build());
            Log.info("Forum post " + post.getPostId() + " on event " + post.getEventId()
                    + " by " + token.getUsername());

            return ok(postToMap(datastore.get(key)));

        } catch (Exception e) {
            return Error.fromexception(e);
        }
    }

    // -------------------------------------------------------------------------
    // POST /rest/forum/list
    // -------------------------------------------------------------------------
    @POST
    @Path("/list")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response listMessages(ListForumRequest req) {
        try {
            AuthHelper.verifyToken(req.getToken());

            if (req.getEventId() == null || req.getEventId().isBlank())
                return Error.invalid_input();

            int pageSize = req.getPageSize() > 0 ? Math.min(req.getPageSize(), MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;

            EntityQuery.Builder queryBuilder = Query.newEntityQueryBuilder()
                    .setKind("ForumPost")
                    .setFilter(PropertyFilter.eq("event_id", req.getEventId()))
                    .setOrderBy(OrderBy.asc("created_at"))
                    .setLimit(pageSize);

            if (req.getCursor() != null && !req.getCursor().isBlank())
                queryBuilder.setStartCursor(Cursor.fromUrlSafe(req.getCursor()));

            QueryResults<Entity> results = datastore.run(queryBuilder.build());

            List<Map<String, Object>> posts = new ArrayList<>();
            while (results.hasNext())
                posts.add(postToMap(results.next()));

            Map<String, Object> response = new HashMap<>();
            response.put("posts", posts);
            response.put("count", posts.size());
            // Only hand back a cursor when the page was full — otherwise the
            // client already has everything and should keep reusing its last cursor.
            if (posts.size() == pageSize && results.getCursorAfter() != null)
                response.put("nextCursor", results.getCursorAfter().toUrlSafe());

            return ok(response);

        } catch (Exception e) {
            return Error.fromexception(e);
        }
    }

    // -------------------------------------------------------------------------
    // POST /rest/forum/delete
    // -------------------------------------------------------------------------
    @POST
    @Path("/delete")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response deletePost(DeletePostRequest req) {
        try {
            Token token = AuthHelper.verifyToken(req.getToken());

            if (req.getPostId() == null || req.getPostId().isBlank())
                return Error.invalid_input();

            Key key = datastore.newKeyFactory().setKind("ForumPost").newKey(req.getPostId());
            Entity post = datastore.get(key);
            if (post == null)
                ErrorException.trow(9932);

            String author = post.getString("author_username");
            Entity eventEntity = getEventEntity(post.getString("event_id"));
            String organizer = eventEntity.getString("organizer_username");

            boolean canDelete = token.getUsername().equals(author)
                    || token.getUsername().equals(organizer)
                    || token.getRole() == Role.ADMIN;
            if (!canDelete)
                ErrorException.trow(9905);

            datastore.delete(key);
            return ok(Map.of("message", "Post deleted successfully"));

        } catch (Exception e) {
            return Error.fromexception(e);
        }
    }

    // -------------------------------------------------------------------------
    // GET /rest/forum/cleanup  (called by App Engine cron — see cron.xml)
    // Finds events whose time has passed, marks them COMPLETED, and deletes
    // their forum. Also clears the forum of any CANCELLED event.
    // -------------------------------------------------------------------------
    @GET
    @Path("/cleanup")
    @Produces(MediaType.APPLICATION_JSON)
    public Response cleanup(@Context HttpServletRequest request) {
        // App Engine strips this header from external requests, so its presence
        // proves the call came from the cron service (or an admin).
        if (request.getHeader("X-AppEngine-Cron") == null)
            return Error.forbidden();

        try {
            long now = System.currentTimeMillis() / 1000L;
            int eventsClosed = 0;
            int postsDeleted = 0;

            QueryResults<Entity> events = datastore.run(
                    Query.newEntityQueryBuilder().setKind("Event").build());

            while (events.hasNext()) {
                Entity event = events.next();
                String eventId = event.getString("event_id");
                String status = event.getString("status");
                long end = event.getLong("start_date") + event.getLong("duration_minutes") * 60L;

                boolean cancelled = status.equals(Status.CANCELLED.name());
                boolean ended = now >= end && !status.equals(Status.COMPLETED.name());

                if (cancelled || ended) {
                    postsDeleted += deleteForum(eventId);
                    if (ended) {
                        datastore.put(Entity.newBuilder(event)
                                .set("status", Status.COMPLETED.name())
                                .build());
                        eventsClosed++;
                    }
                }
            }

            Log.info("Forum cleanup: closed " + eventsClosed + " events, deleted " + postsDeleted + " posts");
            return ok(Map.of("eventsClosed", eventsClosed, "postsDeleted", postsDeleted));

        } catch (Exception e) {
            return Error.fromexception(e);
        }
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private Entity getEventEntity(String eventId) throws ErrorException {
        Key key = datastore.newKeyFactory().setKind("Event").newKey(eventId);
        Entity entity = datastore.get(key);
        if (entity == null) ErrorException.trow(9902);
        return entity;
    }

    /** Deletes every ForumPost for an event in batches; returns how many were deleted. */
    private int deleteForum(String eventId) {
        Query<Key> query = Query.newKeyQueryBuilder()
                .setKind("ForumPost")
                .setFilter(PropertyFilter.eq("event_id", eventId))
                .build();
        QueryResults<Key> keys = datastore.run(query);

        int deleted = 0;
        List<Key> batch = new ArrayList<>(DELETE_BATCH);
        while (keys.hasNext()) {
            batch.add(keys.next());
            if (batch.size() == DELETE_BATCH) {
                datastore.delete(batch.toArray(new Key[0]));
                deleted += batch.size();
                batch.clear();
            }
        }
        if (!batch.isEmpty()) {
            datastore.delete(batch.toArray(new Key[0]));
            deleted += batch.size();
        }
        return deleted;
    }

    private Map<String, Object> postToMap(Entity e) {
        Map<String, Object> map = new HashMap<>();
        map.put("postId", e.getString("post_id"));
        map.put("eventId", e.getString("event_id"));
        map.put("authorUsername", e.getString("author_username"));
        map.put("text", e.getString("text"));
        map.put("createdAt", e.getLong("created_at"));
        map.put("parentPostId", e.contains("parent_post_id") ? e.getString("parent_post_id") : null);
        return map;
    }

    private static Response ok(Map<String, Object> data) {
        return ResponceBuilder.constructorsuccess(data);
    }
}
