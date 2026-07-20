import { useEffect, useState } from "react";
import { getEventList } from "../../api/auth";
import type {
  EventItem,
  EventListResponse,
  FilterProps,
} from "../../utils/types";
import EventCard from "./Event-Card";

type EventsListProps = {
  filter: FilterProps;
};

function EventsList({ filter }: EventsListProps) {
  //================= Hooks ===================
  const [events, setEvents] = useState<EventItem[]>([]); //Events got from the request
  const [nextCursor, setNextCursor] = useState<string | undefined>(); //string means there is cursos to next page, undifined means there is no cursor
  const [loading, setLoading] = useState(false); //if the main page is being loaded
  const [loadingMore, setLoadingMore] = useState(false); //if all the events are being loaded
  const [error, setError] = useState<string | null>(null);

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

      const payload = {
        input: {
          category: filter.category || null,
          status: filter.status,
          organizerUsername: filter.organizerUsername,
          isAccessible: filter.isAccessible,
          sdg: filter.sdg || [],
          pageSize: 48,
          cursor: cursor ?? "",
        },
        ...(token && {
          token: {
            jwt: token,
          },
        }),
      };

      console.log(payload);

      const res: EventListResponse = await getEventList(payload);

      console.log(res.data.events);

      if (cursor) {
        setEvents((prev) => [...prev, ...res.data.events]);
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

  useEffect(() => {
    setEvents([]);
    setNextCursor(undefined);
    loadEvents();
  }, [filter]);

  return (
    <>
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
        <div className="alert alert-light" role="alert">
          There is no events availables.
        </div>
      )}

      {!loading && events.length > 0 && (
        <>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 pt-4">
            {events.map((e) => (
              <EventCard key={e.eventId} event={e} />
            ))}
          </div>

          {nextCursor && (
            <div className="text-center mt-5">
              <button
                className="btn px-4"
                onClick={() => loadEvents(nextCursor)}
                disabled={loadingMore}
                style={{
                  background: "var(--color-white)",
                  color: "var(--color-green)",
                }}
              >
                {loadingMore ? "A carregar..." : "Carregar mais"}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default EventsList;
