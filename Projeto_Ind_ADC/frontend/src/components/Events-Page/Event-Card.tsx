import type { EventProps } from "../../utils/types";
import { sdgInfos } from "../../utils/sdgInfo";
import placeholder from "../../assets/images/placeholder.png";

function EventCard({ event }: EventProps) {
  const startDate = new Date(event.startDate * 1000);
  const Ids = [2, 6, 7, 8, 13];

  const formattedDate = startDate.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const sdgIcons = sdgInfos
    .filter((item) => Ids.includes(item.id))
    .map((item) => item.icon);

  return (
    <div className="col">
      <div className="card h-100 shadow-sm">
        <img
          src={event.imageUrls[0] || placeholder}
          className="card-img-top"
          alt={event.title}
          style={{
            height: "180px",
            objectFit: "cover",
          }}
        />

        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <span
              className="badge "
              style={{ background: "var(--color-green)" }}
            >
              {event.category}
            </span>
            <span
              className="badge"
              style={{
                background: "var(--color-bege)",
                color: "var(--color-green)",
              }}
            >
              {event.status}
            </span>
          </div>

          <h5 className="card-title" style={{ color: "var(--color-green)" }}>
            {event.title}
          </h5>

          <p className="card-text text-muted mb-2">{event.location}</p>

          <div className="mt-auto">
            <p className="mb-1">
              <strong style={{ color: "var(--color-green)" }}>Date:</strong>{" "}
              {formattedDate}
            </p>

            <p className="mb-1">
              <strong style={{ color: "var(--color-green)" }}>
                Vacancies:
              </strong>{" "}
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

            <a
              href={`/events/${event.eventId}`}
              className="btn w-100"
              style={{
                background: "var(--color-green)",
                color: "var(--color-white)",
              }}
            >
              Check Event
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventCard;
