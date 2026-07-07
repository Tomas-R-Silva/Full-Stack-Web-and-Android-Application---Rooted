import type { EventProps } from "../../utils/types";
import { sdgInfos } from "../../utils/sdgInfo";
import { useNavigate } from "react-router-dom";
import eventUpcoming from "../../assets/icons/event_upcoming_w.svg";

function EventCardSmall({ event }: EventProps) {
  const startDate = new Date(event.startDate * 1000);
  const Ids = event.sdg ?? [];
  const navigate = useNavigate();

  const formattedDate = startDate.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const sdgIcons = sdgInfos
    .filter((item) => Ids.includes(item.id))
    .map((item) => item.icon);

  return (
    <div
      className="p-4 rounded mb-1"
      style={{
        maxWidth: "500px",
        width: "100%",
        backgroundColor: "var(--color-green2)",
        color: "var(--color-white)",
      }}
    >
      <div className="d-flex justify-content-between align-items-center">
        <span className="fw-bold">{event.title}</span>

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

      <p className="mt-3 mb-0">
        <span className="">
          {event.location} | {formattedDate} |{" "}
          {event.isPublic ? "Público" : "Privado"}
        </span>
      </p>
      <div className="d-flex justify-content-between align-items-center">
        <p className="mt-3 mb-0">
          <span className="">
            Vacancies: {event.attendeeCount}/{event.maxAttendees} |{" "}
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
          </span>
        </p>
        <img
          src={eventUpcoming}
          alt="Event details"
          onClick={() => navigate(`/events/${event.eventId}`)}
          style={{ cursor: "pointer" }}
        />
      </div>
    </div>
  );
}

export default EventCardSmall;
