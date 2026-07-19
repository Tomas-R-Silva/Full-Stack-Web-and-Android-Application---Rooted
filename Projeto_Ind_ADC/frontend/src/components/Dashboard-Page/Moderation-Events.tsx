import { useEffect, useState } from "react";
import { getEventList } from "../../api/auth";
import type { EventItem, EventListResponse } from "../../utils/types";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import eventUpcoming from "../../assets/icons/event_upcoming_w.svg";
import EventControlPanel from "./Event-Control-Panel";

function ModerationEvents() {
  //================= Hooks ===================
  const [events, setEvents] = useState<EventItem[]>([]); //Events got from the request
  const [nextCursor, setNextCursor] = useState<string | undefined>(); //string means there is cursos to next page, undifined means there is no cursor
  const [loading, setLoading] = useState(false); //if the main page is being loaded
  const [loadingMore, setLoadingMore] = useState(false); //if all the events are being loaded
  const [error, setError] = useState<string | null>(null);
  const { username } = useAuth();
  const [managedEvent, setManagedEvent] = useState<EventItem | null>(null);
  const navigate = useNavigate();

  //============== Get the events =============
  const loadEvents = async (cursor?: string) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }
      if (!username) {
        console.log("Invalid username");
        return;
      }

      console.log(username);

      const res: EventListResponse = await getEventList({
        token: { jwt: token },
        input: {
          pageSize: 12,
          cursor: cursor ?? null,
          category: null,
          organizerUsername: null,
          status: null,
          isAccessible: null,
          sdg: [],
        },
      });

      console.log(res.data.events);

      if (cursor) {
        setEvents((prev) => [...prev, ...res.data.events]); //carregar mais => anteriores mais todos os restantes
      } else {
        setEvents(res.data.events);
      }

      setManagedEvent(res.data.events[0]);

      setNextCursor(res.data.nextCursor);
    } catch (err) {
      console.error(err);
      setError("Could not load the events.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleManagedEvent = (event: EventItem) => {
    setManagedEvent(event);
  };

  const totalEvents = events.length;

  const totalUpcoming = events.filter((e) => e.status === "UPCOMING").length;

  const totalLive = events.filter((e) => e.status === "LIVE").length;

  const totalFinished = events.filter((e) => e.status === "FINISHED").length;

  const totalCanceled = events.filter((e) => e.status === "CANCELED").length;

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <>
      <div className="container py-3">
        <div className="row">
          <div className="col-4">
            <h4>All Events:</h4>
            <div
              className="container border rounded p-3"
              style={{
                maxHeight: "1100px",
                overflowY: "auto",
              }}
            >
              <div className="mb-3">
                {loading && (
                  <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {!loading && !error && events.length === 0 && (
                  <div className="alert alert-ligth" role="alert">
                    There is no events availables.
                  </div>
                )}

                {!loading && events.length > 0 && (
                  <>
                    {events.map((event) => (
                      <div
                        className="p-4 rounded mb-1"
                        style={{
                          maxWidth: "500px",
                          width: "100%",
                          backgroundColor:
                            managedEvent?.eventId === event.eventId
                              ? "var(--color-green)"
                              : "var(--color-green2)",
                          color: "var(--color-white)",
                          cursor: "pointer",
                        }}
                        onClick={() => handleManagedEvent(event)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold">{event.title}</span>

                          <span
                            className="badge"
                            style={{
                              background: "var(--color-bege)",
                              color: "var(--color-green)",
                            }}
                          >
                            {event.status}
                          </span>
                        </div>

                        <p className="mt-3 mb-0">
                          <span className="">
                            Organizer: {event.organizerUsername}
                          </span>
                        </p>

                        <div className="d-flex justify-content-between align-items-center">
                          <p className="mt-3 mb-0">
                            <span className="">Id:{event.eventId}</span>
                          </p>
                          <img
                            src={eventUpcoming}
                            alt="Event details"
                            onClick={() => navigate(`/events/${event.eventId}`)}
                            style={{ cursor: "pointer" }}
                          />
                        </div>
                      </div>
                    ))}

                    {nextCursor && (
                      <div className="text-center mt-5">
                        <button
                          className="btn px-4"
                          onClick={() => loadEvents(nextCursor)}
                          disabled={loadingMore}
                          style={{
                            background: "var(--color-green)",
                            color: "var(--color-white)",
                          }}
                        >
                          {loadingMore ? "A carregar..." : "Carregar mais"}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <div
              className="container border rounded p-3 mt-3"
              style={{
                backgroundColor: "var(--color-green2)",
                color: "var(--color-white)",
              }}
            >
              <div className="d-flex justify-content-between">
                <span>Total Events</span>
                <strong>{totalEvents}</strong>
              </div>

              <hr className="my-2" />

              <div className="d-flex justify-content-between">
                <span>Upcoming</span>
                <strong>{totalUpcoming}</strong>
              </div>

              <div className="d-flex justify-content-between">
                <span>Live</span>
                <strong>{totalLive}</strong>
              </div>

              <div className="d-flex justify-content-between">
                <span>Finished</span>
                <strong>{totalFinished}</strong>
              </div>

              <div className="d-flex justify-content-between">
                <span>Canceled</span>
                <strong>{totalCanceled}</strong>
              </div>
            </div>
          </div>

          <div className="col-8">
            {managedEvent && <EventControlPanel event={managedEvent} />}
          </div>
        </div>
      </div>
    </>
  );
}

export default ModerationEvents;
