import { useEffect, useState } from "react";
import { getEventList } from "../../api/auth";
import type { EventItem, EventListResponse } from "../../utils/types";
import EventCardSmall from "../Events-Page/Event-Card-Small";
import { useAuth } from "../AuthContext";

function AccountEvents() {
  //================= Hooks ===================
  const [events, setEvents] = useState<EventItem[]>([]); //Events got from the request
  const [nextCursor, setNextCursor] = useState<string | undefined>(); //string means there is cursos to next page, undifined means there is no cursor
  const [loading, setLoading] = useState(false); //if the main page is being loaded
  const [loadingMore, setLoadingMore] = useState(false); //if all the events are being loaded
  const [error, setError] = useState<string | null>(null);
  const { username } = useAuth();

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
          category: null,
          status: null,
          organizerUsername: username,
          pageSize: 10,
          cursor: cursor ?? null,
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

      setNextCursor(res.data.nextCursor);
    } catch (err) {
      console.error(err);
      setError("Could not load the events.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  //fetch on page render
  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <>
      <div className="container">
        <div className="row w-100 justify-content-center">
          <div className="col-12 col-lg-8">
            <h1 className="fw-bold text-white mb-3">My Events</h1>

            <p className="text-white mb-4">
              Check all the events that are organized by this account.
            </p>

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
                <div
                  className="alert alert-light"
                  style={{ color: "var(--color-green)" }}
                  role="alert"
                >
                  You have no events.
                </div>
              )}

              {!loading && events.length > 0 && (
                <>
                  {events.map((e) => (
                    <EventCardSmall key={e.eventId} event={e} />
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
        </div>
      </div>
    </>
  );
}

export default AccountEvents;
