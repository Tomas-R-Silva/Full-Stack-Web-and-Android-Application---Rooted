import { useEffect, useState } from "react";
import NavBar from "../NavBar/NavBar";
import { getEventList } from "../../api/auth";
import type { EventResponse, EventListResponse } from "../../utils/types";
import EventCard from "./Event-Card";

function EventsPage() {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async (cursor?: string) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const res: EventListResponse = await getEventList({
        pageSize: 8,
        cursor,
      });

      if (cursor) {
        setEvents((prev) => [...prev, ...res.events]);
      } else {
        setEvents(res.events);
      }

      setNextCursor(res.nextCursor);
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar os eventos.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <>
      <NavBar />

      <main className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">Eventos</h1>
        </div>

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">A carregar...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="alert alert-info" role="alert">
            Ainda não existem eventos disponíveis.
          </div>
        )}

        {!loading && events.length > 0 && (
          <>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
              {events.map(({ event }) => (
                <EventCard key={event.eventId} event={event} />
              ))}
            </div>

            {nextCursor && (
              <div className="text-center mt-5">
                <button
                  className="btn btn-success px-4"
                  onClick={() => loadEvents(nextCursor)}
                  disabled={loadingMore}
                >
                  {loadingMore ? "A carregar..." : "Carregar mais"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

export default EventsPage;
