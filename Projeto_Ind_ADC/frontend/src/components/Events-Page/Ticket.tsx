import type { EventProps } from "../../utils/types";
import { sdgInfos } from "../../utils/sdgInfo";
import { useAuth } from "../AuthContext";
import editSquare from "../../assets/icons/edit_square.svg";
import { useState, useEffect } from "react";
import EventUpdater from "./Event-Updater";
import type { RequestEventUpdate } from "../../utils/types";
import type {
  RequestEventAttend,
  EventAttendResponse,
} from "../../utils/types";
import type {
  RequestEventUnattend,
  EventUnattendResponse,
} from "../../utils/types";
import type { RequestIsAttendee, IsAttendeeResponse } from "../../utils/types";
import { attendEvent, unattendEvent, isAttendee } from "../../api/auth";
import { useNavigate } from "react-router-dom";

function Ticket({ event }: EventProps) {
  const startDate = new Date(event.startDate / 1000);
  const Ids = event.sdg ?? [];
  const { isAuthenticated, username } = useAuth();
  const [IsAttendee, setIsAttendee] = useState(false);

  const navigate = useNavigate();

  const formattedDate = startDate.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const formattedTime = startDate.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const sdgIcons = sdgInfos
    .filter((item) => Ids.includes(item.id))
    .map((item) => item.icon);

  const handleAttend = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }
      const payload: RequestEventAttend = {
        token: {
          jwt: token,
        },
        input: {
          eventId: event.eventId,
        },
      };
      console.log(payload);
      const response = await attendEvent(payload);
      console.log(response);
      navigate("/events/" + event.eventId);
      window.location.reload();
    } catch (err) {
      console.log("Something went wrong!");
    }
  };

  const handleUnattend = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }
      const payload: RequestEventUnattend = {
        token: {
          jwt: token,
        },
        input: {
          eventId: event.eventId,
        },
      };
      console.log(payload);
      const response = await unattendEvent(payload);
      console.log(response);
      navigate("/events/" + event.eventId);
      window.location.reload();
    } catch (err) {
      console.log("Something went wrong!");
    }
  };

  const handleIsAttendee = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token || !username) {
        console.log("User is not authenticated");
        return;
      }
      const payload: RequestIsAttendee = {
        token: {
          jwt: token,
        },
        input: {
          username: username,
          eventId: event.eventId,
        },
      };
      console.log(payload);
      const response = await isAttendee(payload);
      setIsAttendee(response.data.isattendee);
      console.log(response);
    } catch (err) {
      console.log("Something went wrong!");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      handleIsAttendee();
    }
  }, [event.eventId, isAuthenticated]);

  return (
    <>
      <div
        className="card"
        style={{
          minWidth: "1000px",
          height: event.title.length > 25 ? "320px" : "280px",
          filter: "drop-shadow(0 0 8px black)",
        }}
      >
        <div className="row">
          <div
            className="col-8"
            style={{ borderRight: "3px dotted var(--color-green)" }}
          >
            <div className="container py-3 px-3">
              <h1>{event.title} </h1>

              <p>{event.location} </p>
              <div className="mt-auto">
                <p className="mb-1">
                  <strong style={{ color: "var(--color-green)" }}>Date:</strong>{" "}
                  {formattedDate}{" "}
                </p>

                <p className="mb-1">
                  <strong style={{ color: "var(--color-green)" }}>Time:</strong>{" "}
                  {formattedTime}
                </p>

                <p className="mb-1">
                  <strong style={{ color: "var(--color-green)" }}>
                    Duration:
                  </strong>{" "}
                  {event.durationMinutes} min{" "}
                </p>

                <p className="mb-1">
                  <strong style={{ color: "var(--color-green)" }}>
                    Vacancies:
                  </strong>{" "}
                  {event.attendeeCount} /{event.maxAttendees}{" "}
                </p>

                <p className="mb-3">
                  {sdgIcons.map((icon, i) => (
                    <img
                      key={i}
                      src={icon}
                      alt="SDG icon"
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "8px",
                      }}
                    />
                  ))}
                </p>
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="container py-3 px-3">
              <p className="mb-1">
                <strong style={{ color: "var(--color-green)" }}>
                  Status:{" "}
                </strong>
                <span
                  className="badge "
                  style={{ background: "var(--color-green)" }}
                >
                  {event.status}
                </span>
              </p>
              <p className="mb-1">
                <strong style={{ color: "var(--color-green)" }}>
                  Category:{" "}
                </strong>
                <span
                  className="badge "
                  style={{ background: "var(--color-green)" }}
                >
                  {event.category}
                </span>
              </p>
              {isAuthenticated && (
                <p className="mb-1">
                  {!IsAttendee && (
                    <button
                      className="btn rounded-pill mt-2"
                      style={{
                        background: "var(--color-green)",
                        color: "var(--color-white)",
                      }}
                      onClick={handleAttend}
                    >
                      Attend
                    </button>
                  )}
                  {IsAttendee && (
                    <button
                      className="btn rounded-pill mt-2 ms-3"
                      style={{
                        background: "var(--color-green)",
                        color: "var(--color-white)",
                      }}
                      onClick={handleUnattend}
                    >
                      Unattend
                    </button>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Ticket;
