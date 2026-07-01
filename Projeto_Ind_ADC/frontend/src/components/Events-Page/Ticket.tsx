import type { EventProps } from "../../utils/types";
import { sdgInfos } from "../../utils/sdgInfo";

function Ticket({ event }: EventProps) {
  console.log(event);
  const startDate = new Date(event.startDate * 1000);
  const Ids = [2, 6, 7, 8, 13];

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

  return (
    <div className="card" style={{ maxWidth: "800px", height: "280px" }}>
      <div className="row">
        <div
          className="col-8"
          style={{ borderRight: "3px dotted var(--color-green)" }}
        >
          <div className="container py-3 px-3">
            <h1>{event.title}</h1>
            <p>{event.location}</p>
            <div className="mt-auto">
              <p className="mb-1">
                <strong style={{ color: "var(--color-green)" }}>Data:</strong>{" "}
                {formattedDate}
              </p>

              <p className="mb-1">
                <strong style={{ color: "var(--color-green)" }}>Hora:</strong>{" "}
                {formattedTime}
              </p>

              <p className="mb-1">
                <strong style={{ color: "var(--color-green)" }}>
                  Duração:
                </strong>{" "}
                {event.durationMinutes} min
              </p>

              <p className="mb-1">
                <strong style={{ color: "var(--color-green)" }}>Vagas:</strong>{" "}
                {event.attendeeCount}/{event.maxAttendees}
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
          <div className="container py-3 px-3">right</div>
        </div>
      </div>
    </div>
  );
}

export default Ticket;
