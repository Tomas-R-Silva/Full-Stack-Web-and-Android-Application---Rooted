import type { EventItem } from "../../utils/types";

type EventCardProps = {
  event: EventItem;
};

function EventCard({ event }: EventCardProps) {
  const startDate = new Date(event.startDate * 1000);

  const formattedDate = startDate.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const formattedTime = startDate.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="col">
      <div className="card h-100 shadow-sm">
        <img
          src={event.coverImageUrl || "/placeholder-event.jpg"}
          className="card-img-top"
          alt={event.title}
          style={{
            height: "180px",
            objectFit: "cover",
          }}
        />

        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <span className="badge bg-success">{event.category}</span>
            <span className="badge bg-secondary">{event.status}</span>
          </div>

          <h5 className="card-title">{event.title}</h5>

          <p className="card-text text-muted mb-2">{event.location}</p>

          <p className="card-text">{event.description}</p>

          <div className="mt-auto">
            <p className="mb-1">
              <strong>Data:</strong> {formattedDate}
            </p>

            <p className="mb-1">
              <strong>Hora:</strong> {formattedTime}
            </p>

            <p className="mb-1">
              <strong>Duração:</strong> {event.durationMinutes} min
            </p>

            <p className="mb-3">
              <strong>Vagas:</strong> {event.attendeeCount}/{event.maxAttendees}
            </p>

            <a
              href={`/events/${event.eventId}`}
              className="btn btn-success w-100"
            >
              Ver evento
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventCard;
