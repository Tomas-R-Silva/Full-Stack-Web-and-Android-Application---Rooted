import type { EventProps } from "../../utils/types";
import { sdgInfos } from "../../utils/sdgInfo";
import { useAuth } from "../AuthContext";
import editSquare from "../../assets/icons/edit_square.svg";
import { useState } from "react";
import EventUpdater from "./Event-Updater";
import type { RequestEventUpdate } from "../../utils/types";

function Ticket({ event }: EventProps) {
  console.log(event);
  const startDate = new Date(event.startDate * 1000);
  const Ids = [2, 6, 7, 8, 13];
  const { isAuthenticated, username } = useAuth();
  const [showModal, setShowModal] = useState(false);
  type UpdateField = keyof RequestEventUpdate["input"];
  const [field, setField] = useState<UpdateField>("title");

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
                  <strong style={{ color: "var(--color-green)" }}>Data:</strong>{" "}
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
                  <strong style={{ color: "var(--color-green)" }}>Hora:</strong>{" "}
                  {formattedTime}
                </p>

                <p className="mb-1">
                  <strong style={{ color: "var(--color-green)" }}>
                    Duração:
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
                    Vagas:
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
                  className="badge"
                  style={{
                    background: "var(--color-bege)",
                    color: "var(--color-green)",
                  }}
                >
                  {event.status}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      {showModal && <EventUpdater {...UpdateProps} />}
    </>
  );
}

export default Ticket;
