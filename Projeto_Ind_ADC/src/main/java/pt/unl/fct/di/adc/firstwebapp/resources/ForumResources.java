package pt.unl.fct.di.adc.firstwebapp.resources;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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
import pt.unl.fct.di.adc.firstwebapp.Objects.EventFull;
import pt.unl.fct.di.adc.firstwebapp.Objects.EventFull.Status;
import pt.unl.fct.di.adc.firstwebapp.Objects.EventInputInterface;
import pt.unl.fct.di.adc.firstwebapp.Objects.ForumFull;
import pt.unl.fct.di.adc.firstwebapp.Objects.FriendFull;
import pt.unl.fct.di.adc.firstwebapp.Objects.ForumFull.ForumType;
import pt.unl.fct.di.adc.firstwebapp.Objects.TokenFull;
import pt.unl.fct.di.adc.firstwebapp.Objects.UserFull;
import pt.unl.fct.di.adc.firstwebapp.Objects.User.Role;
import pt.unl.fct.di.adc.firstwebapp.Utilities.AuthHelper;
import pt.unl.fct.di.adc.firstwebapp.Utilities.ResponceBuilder;
import pt.unl.fct.di.adc.firstwebapp.error.Error;
import pt.unl.fct.di.adc.firstwebapp.error.ErrorException;
import pt.unl.fct.di.adc.firstwebapp.model.ForumKeyTokenRequest;
import pt.unl.fct.di.adc.firstwebapp.model.ListForumRequest;
import pt.unl.fct.di.adc.firstwebapp.model.ListForumRequest.ListForumInput;
import pt.unl.fct.di.adc.firstwebapp.model.PostMessageRequest;

@Path("/forum")
public class ForumResources {

	private static final Datastore datastore = DatastoreOptions.newBuilder().setProjectId(AuthHelper.PROJECT_ID).build().getService();

	private static final Logger Log = Logger.getLogger(ForumResources.class.getName());
	private static final int DEFAULT_PAGE_SIZE = 50;
	private static final int MAX_PAGE_SIZE = 100;

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
			TokenFull token = AuthHelper.verifyToken(req);
			ForumFull post;
			if(req.getInput().getType().equals(ForumType.EVENT)) {
				EventFull eventEntity = getEventEntity(req.getInput());
				if (eventEntity.isStatuss(new Status[] {Status.CANCELLED,Status.COMPLETED}))
					ErrorException.trow(9931); // event is closed, forum no longer accepts posts
				post=ForumFull.newforumevent(datastore, eventEntity, token, req.getInput());
				Log.info("Forum post " + post.getPostId() + " on event " + post.getEventId()
				+ " by " + token.getUsername());
			}else {
				UserFull user = AuthHelper.getUser(req.getInput().getId());
				FriendFull friend = FriendFull.fromdatabase(token,user);
				post=ForumFull.newforumfriend(datastore, friend, token, req.getInput());
				Log.info("Forum post " + post.getPostId() + " for " + post.getFriendId()
				+ " by " + token.getUsername());
			}
			datastore.put(post.toentity());
			return ok(post.tomap());
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
			AuthHelper.verifyToken(req);
			ListForumInput input=req.getInput();
			if (input.getType() == null || input.getId() == null || input.getId().isBlank())
				return Error.invalid_input();

			int pageSize = input.getPageSize() > 0 ? Math.min(input.getPageSize(), MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;

			EntityQuery.Builder queryBuilder = Query.newEntityQueryBuilder()
					.setKind("ForumPost").setOrderBy(OrderBy.asc("created_at"))
					.setLimit(pageSize);
			if(input.getType().equals(ForumType.EVENT))
				queryBuilder.setFilter(PropertyFilter.eq("event_id", input.getEventId()));
			else if(input.getType().equals(ForumType.FRIEND))
				queryBuilder.setFilter(PropertyFilter.eq("friend_id", input.getId()));

			if (input.getCursor() != null && !input.getCursor().isBlank())
				queryBuilder.setStartCursor(Cursor.fromUrlSafe(input.getCursor()));

			QueryResults<Entity> results = datastore.run(queryBuilder.build());

			List<Map<String, Object>> posts = new ArrayList<>();
			while (results.hasNext())
				posts.add(ForumFull.fromdatabase(results.next()).tomap());

			// Only hand back a cursor when the page was full — otherwise the
			// client already has everything and should keep reusing its last cursor.
			return ok(Map.of("posts", posts,"count", posts.size(),"nextCursor",
					(posts.size() == pageSize && results.getCursorAfter() != null)?
							results.getCursorAfter().toUrlSafe():null));
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
	public Response deletePost(ForumKeyTokenRequest req) {
		try {
			TokenFull token = AuthHelper.verifyToken(req);
			Key key = datastore.newKeyFactory().setKind("ForumPost").newKey(req.getInput().getForumKey());
			ForumFull post=ForumFull.fromdatabase(datastore.get(key));
			if (post == null)
				ErrorException.trow(9932);

			if(post.isType(ForumType.EVENT)) {
				String author = post.getAuthorUsername();
				EventFull eventEntity = getEventEntity(post);
				String organizer = eventEntity.getOrganizerUsername();

				if (!token.getUsername().equals(author)
						&& !token.getUsername().equals(organizer)
						&& token.getRole() != Role.ADMIN)
					ErrorException.trow(9905);
			}
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
			return Error.errorswitch(9939);

		try {
			int eventsClosed = 0,postsDeleted = 0;
			QueryResults<Entity> events = datastore.run(Query.newEntityQueryBuilder().setKind("Event").build());

			while (events.hasNext()) {
				EventFull event = EventFull.fromdatabase(events.next());
				if(event.getStarted() && event.isStatus(Status.UPCOMING))
					event.setStatus(event.inLimit()?Status.ONGOING:Status.CANCELLED);
				if(event.isStatus(Status.CANCELLED)) 
					postsDeleted += AuthHelper.querydelete("ForumPost", "event_id", event.getEventId());
				else if (event.getEnded() && !event.isStatus(Status.COMPLETED)){
					postsDeleted += AuthHelper.querydelete("ForumPost", "event_id", event.getEventId());
					event.setStatus(Status.COMPLETED);
					datastore.put(event.toentity());
					eventsClosed++;
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

	private EventFull getEventEntity(EventInputInterface event) throws ErrorException {
		if (event.getEventId() == null || event.getEventId().isBlank())
			ErrorException.trow(9906);
		return getEventEntity(event.getEventId());
	}

	private EventFull getEventEntity(String event) throws ErrorException {
		Key key = datastore.newKeyFactory().setKind("Event").newKey(event);
		Entity entity = datastore.get(key);
		if (entity == null) ErrorException.trow(9902);
		return EventFull.fromdatabase(entity);
	}

	private static Response ok(Map<String, Object> data) {
		return ResponceBuilder.constructorsuccess(data);
	}
}
