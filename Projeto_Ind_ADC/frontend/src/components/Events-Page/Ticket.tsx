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
  const startDate = new Date(event.startDate * 1000);
  const Ids = [2, 6, 7, 8, 13];
  const { isAuthenticated, username } = useAuth();
  const [showModal, setShowModal] = useState(false);
  type UpdateField = keyof RequestEventUpdate["input"];
  const [field, setField] = useState<UpdateField>("title");
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

  const handleUpdate = (newField: any) => {
    setShowModal(true);
    setField(newField);
  };

  const UpdateProps = {
    onClose: () => setShowModal(false),
    event,
    field,
  };

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
      setIsAttendee(response.data.eventId);
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
          height: "280px",
          filter: "drop-shadow(0 0 8px black)",
        }}
      >
        <div className="row">
          <div
            className="col-8"
            style={{ borderRight: "3px dotted var(--color-green)" }}
          >
            <div className="container py-3 px-3">
              <h1>
                {event.title}{" "}
                {isAuthenticated && event.organizerUsername === username && (
                  <img
                    src={editSquare}
                    onClick={() => handleUpdate("title")}
                    style={{ cursor: "pointer" }}
                  />
                )}
              </h1>

              <p>
                {event.location}{" "}
                {isAuthenticated && event.organizerUsername === username && (
                  <img
                    src={editSquare}
                    onClick={() => handleUpdate("location")}
                    style={{ cursor: "pointer" }}
                  />
                )}
              </p>
              <div className="mt-auto">
                <p className="mb-1">
                  <strong style={{ color: "var(--color-green)" }}>Date:</strong>{" "}
                  {formattedDate}{" "}
                  {isAuthenticated && event.organizerUsername === username && (
                    <img
                      src={editSquare}
                      onClick={() => handleUpdate("startDate")}
                      style={{ cursor: "pointer" }}
                    />
                  )}
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
                  {isAuthenticated && event.organizerUsername === username && (
                    <img
                      src={editSquare}
                      onClick={() => handleUpdate("durationMinutes")}
                      style={{ cursor: "pointer" }}
                    />
                  )}
                </p>

                <p className="mb-1">
                  <strong style={{ color: "var(--color-green)" }}>
                    Vacancies:
                  </strong>{" "}
                  {event.attendeeCount}{" "}
                  {isAuthenticated && event.organizerUsername === username && (
                    <img
                      src={editSquare}
                      onClick={() => handleUpdate("minAttendees")}
                      style={{ cursor: "pointer" }}
                    />
                  )}
                  /{event.maxAttendees}{" "}
                  {isAuthenticated && event.organizerUsername === username && (
                    <img
                      src={editSquare}
                      onClick={() => handleUpdate("maxAttendees")}
                      style={{ cursor: "pointer" }}
                    />
                  )}
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
      {showModal && <EventUpdater {...UpdateProps} />}
    </>
  );
}

export default Ticket;
