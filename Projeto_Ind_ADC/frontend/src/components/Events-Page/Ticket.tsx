import type { EventProps } from "../../utils/types";
import { sdgInfos } from "../../utils/sdgInfo";
import { useAuth } from "../AuthContext";
import { useState, useEffect } from "react";
import type {
  RequestEventAttend,
  RequestEventUnattend,
  RequestIsAttendee,
} from "../../utils/types";
import { attendEvent, unattendEvent, isAttendee } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import accessible_w from "../../assets/icons/accessible_w.svg";
import { useNotification } from "../NotificationContext";

function Ticket({ event }: EventProps) {
  const startDate = new Date(event.startDate);
  const Ids = event.SDG ?? [];
  const { isAuthenticated, username } = useAuth();
  const [IsAttendee, setIsAttendee] = useState(false);
  const { notify } = useNotification();

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

  const handleAttend = async (e: React.MouseEvent<HTMLButtonElement>) => {
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
      if (response.status === 200) {
        if (response.data.status === "PENDING") {
          if (response.data.message.includes("already")) {
            notify("EVENT_PENDING_REQUEST");
          } else {
            notify("EVENT_ATTENDED_REQUEST");
            window.location.reload();
          }
        } else {
          notify("EVENT_ATTENDED");
          window.location.reload();
        }
      }
    } catch (err) {
      console.log("Something went wrong!");
    }
  };

  const handleUnattend = async (e: React.MouseEvent<HTMLButtonElement>) => {
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
      if (response.status === 200) {
        notify("EVENT_UNATTENDED");
      }
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
  }, [event.eventId, isAuthenticated, username]);

  return (
    <div className="container-fluid px-2 px-sm-3 px-md-4">
      <div
        className="card mx-auto my-3"
        style={{
          width: "100%",
          maxWidth: "1000px",
          filter: "drop-shadow(0 0 8px black)",
          overflow: "hidden",
        }}
      >
        <div className="row g-0">
          <div
            className="col-12 col-lg-8"
            style={{
              borderRight: "3px dotted var(--color-green)",
            }}
          >
            <div className="container-fluid py-3 px-3 px-md-4">
              <h1
                className="mb-2"
                style={{
                  fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                {event.title}
              </h1>

              <p
                className="mb-3"
                style={{
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                {event.location}
              </p>

              <div>
                <p className="mb-1">
                  <strong style={{ color: "var(--color-green)" }}>Date:</strong>{" "}
                  {formattedDate}
                </p>

                <p className="mb-1">
                  <strong style={{ color: "var(--color-green)" }}>Time:</strong>{" "}
                  {formattedTime}
                </p>

                <p className="mb-1">
                  <strong style={{ color: "var(--color-green)" }}>
                    Duration:
                  </strong>{" "}
                  {event.durationMinutes} min
                </p>

                <p className="mb-1">
                  <strong style={{ color: "var(--color-green)" }}>
                    Vacancies:
                  </strong>{" "}
                  {event.attendeeCount} / {event.maxAttendees}
                </p>

                <div className="d-flex flex-wrap gap-1 mt-2 mb-3">
                  {sdgIcons.map((icon, i) => (
                    <img
                      key={i}
                      src={icon}
                      alt="SDG icon"
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "8px",
                        objectFit: "cover",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            className="col-12 col-lg-4"
            style={{
              borderTop: "3px dotted var(--color-green)",
            }}
          >
            <div className="container-fluid py-3 px-3 px-md-4">
              <p className="mb-2">
                <strong style={{ color: "var(--color-green)" }}>
                  Status:{" "}
                </strong>
                <span
                  className="badge"
                  style={{ background: "var(--color-green)" }}
                >
                  {event.status}
                </span>
              </p>

              <p className="mb-2">
                <strong style={{ color: "var(--color-green)" }}>
                  Category:{" "}
                </strong>
                <span
                  className="badge"
                  style={{ background: "var(--color-green)" }}
                >
                  {event.category}
                </span>
              </p>

              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span
                  className="badge"
                  style={{
                    background: "var(--color-green2)",
                    color: "var(--color-white)",
                  }}
                >
                  {event.isPublic ? "Public" : "Private"}
                </span>

                {event.isAccessible && (
                  <span
                    className="badge d-inline-flex align-items-center justify-content-center"
                    style={{
                      background: "var(--color-ods16)",
                      color: "var(--color-white)",
                    }}
                  >
                    <img
                      src={accessible_w}
                      alt="Accessible event"
                      style={{
                        width: "12px",
                        height: "12px",
                      }}
                    />
                  </span>
                )}
              </div>

              {isAuthenticated && (
                <div className="mt-3">
                  {!IsAttendee && (
                    <button
                      className="btn rounded-pill mt-2 w-100 w-sm-auto"
                      style={{
                        background: "var(--color-green)",
                        color: "var(--color-white)",
                        minWidth: "120px",
                      }}
                      onClick={handleAttend}
                    >
                      Attend
                    </button>
                  )}

                  {IsAttendee && (
                    <button
                      className="btn rounded-pill mt-2 w-100 w-sm-auto"
                      style={{
                        background: "var(--color-green)",
                        color: "var(--color-white)",
                        minWidth: "120px",
                      }}
                      onClick={handleUnattend}
                    >
                      Unattend
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @media (min-width: 992px) {
            .card .col-lg-4 {
              border-top: none !important;
            }
          }

          @media (max-width: 991.98px) {
            .card .col-lg-8 {
              border-right: none !important;
            }
          }

          @media (min-width: 576px) {
            .w-sm-auto {
              width: auto !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Ticket;
