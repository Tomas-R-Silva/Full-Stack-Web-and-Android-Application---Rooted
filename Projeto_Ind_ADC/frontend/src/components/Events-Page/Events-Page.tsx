import { useEffect, useState } from "react";
import NavBar from "../NavBar/NavBar";
import { getEventList } from "../../api/auth";
import type { EventItem, EventListResponse } from "../../utils/types";
import EventCard from "./Event-Card";
import EventModal from "./Event-Modal";
import { useAuth } from "../AuthContext";
import SDOslider from "../SDO-elements/SDO-slider";

function EventsPage() {
  //================= Hooks ===================
  const [events, setEvents] = useState<EventItem[]>([]); //Events got from the request
  const [nextCursor, setNextCursor] = useState<string | undefined>(); //string means there is cursos to next page, undifined means there is no cursor
  const [loading, setLoading] = useState(false); //if the main page is being loaded
  const [loadingMore, setLoadingMore] = useState(false); //if all the events are being loaded
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { isAuthenticated } = useAuth();

  //============== Get the events =============
  const loadEvents = async (cursor?: string) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError(null); //reset errors

      //TODO change in order to have filters
      const res: EventListResponse = await getEventList({
        pageSize: 10,
        cursor: cursor ?? "",
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

  const authenticatedToModal = () => {
    if (isAuthenticated) {
      setShowModal(true);
    }
  };

  //fetch on page render
  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <>
      <NavBar />

      <div
        className="container py-5"
        style={{ filter: showModal ? "blur(4px)" : "none" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0" style={{ color: "var(--color-white" }}>
            Events
          </h1>

          <button
            className="btn"
            style={{
              background: "var(--color-white)",
              color: "var(--color-green)",
            }}
            onClick={authenticatedToModal}
          >
            Create Event
          </button>
        </div>

        <SDOslider />

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
          <div className="alert alert-info" role="alert">
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
      {showModal && <EventModal onClose={() => setShowModal(false)} />}
    </>
  );
}

export default EventsPage;
