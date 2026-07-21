import type {
  Attends,
  EventGetterResponse,
  EventItem,
  RequestEventGetter,
  UserAttendsResponse,
} from "../../utils/types";
import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { getEvent, UserAttends } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import eventUpcoming from "../../assets/icons/event_upcoming_w.svg";

function AccountAttends() {
  const [attends, setAttends] = useState<Attends[]>([]);
  const [eventsById, setEventsById] = useState<Record<string, EventItem>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { username } = useAuth();
  const navigate = useNavigate();

  const loadAttends = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = sessionStorage.getItem("token");

      if (!token) {
        console.log("User is not authenticated");
        setError("User is not authenticated.");
        return;
      }

      if (!username) {
        console.log("Invalid username");
        setError("Invalid username.");
        return;
      }

      const res: UserAttendsResponse = await UserAttends({
        token: { jwt: token },
        input: {
          username,
        },
      });

      const fetchedAttends = res.data.myattends ?? [];

      setAttends(fetchedAttends);

      const fetchedEvents = await Promise.all(
        fetchedAttends.map(async (attend) => {
          try {
            const request: RequestEventGetter = {
              token: { jwt: token },
              input: { eventId: attend.eventId },
            };

            const eventRes: EventGetterResponse = await getEvent(request);

            return {
              eventId: attend.eventId,
              event: eventRes.data.event,
            };
          } catch (err) {
            console.error(`Could not load event ${attend.eventId}`, err);
            return null;
          }
        }),
      );

      const nextEventsById = fetchedEvents.reduce<Record<string, EventItem>>(
        (acc, item) => {
          if (item) {
            acc[item.eventId] = item.event;
          }

          return acc;
        },
        {},
      );

      setEventsById(nextEventsById);
    } catch (err) {
      console.error(err);
      setError("Could not load the events.");
    } finally {
      setLoading(false);
    }
  };

  const longToVisualDate = (date: number) => {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (!username) return;

    loadAttends();
  }, [username]);

  return (
    <div className="container">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-lg-8">
          <h1 className="fw-bold text-white mb-3">My Attends</h1>

          <p className="text-white mb-4">
            Check all the events that this account is attending.
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

            {!loading && !error && attends.length === 0 && (
              <div
                className="alert alert-light"
                style={{ color: "var(--color-green)" }}
                role="alert"
              >
                You are not attending any event at this moment.
              </div>
            )}

            {!loading &&
              !error &&
              attends.length > 0 &&
              attends.map((attend) => {
                const event = eventsById[attend.eventId];

                return (
                  <div
                    key={attend.eventId}
                    className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 p-4 rounded mt-2"
                    style={{
                      width: "100%",
                      backgroundColor: "var(--color-green2)",
                      color: "var(--color-white)",
                    }}
                  >
                    <div>
                      <div>
                        <span className="fw-semibold">Event: </span>
                        <span>{event?.title ?? "Unknown event"}</span>
                      </div>

                      <div>
                        <span className="fw-semibold">Joined at: </span>
                        <span>{longToVisualDate(attend.joinedAt)}</span>
                      </div>
                    </div>

                    <div className="d-flex gap-3">
                      <img
                        src={eventUpcoming}
                        alt="View event"
                        onClick={() => navigate("/events/" + attend.eventId)}
                        style={{
                          cursor: "pointer",
                          width: "28px",
                          height: "28px",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountAttends;
