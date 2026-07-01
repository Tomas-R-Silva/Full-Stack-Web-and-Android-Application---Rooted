import NavBar from "../NavBar/NavBar";
import Ticket from "./Ticket";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type {
  RequestEventGetter,
  EventGetterResponse,
  EventItem,
} from "../../utils/types";
import { getEvent } from "../../api/auth";

function EventElements() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventItem | undefined>();

  const loadEvents = async (id: string) => {
    const request: RequestEventGetter = {
      token: { jwt: "" },
      input: { eventId: id },
    };
    const res: EventGetterResponse = await getEvent(request);

    console.log(res);

    setEvent(res.data.event);

    console.log(event);
  };

  useEffect(() => {
    if (!id) return;
    loadEvents(id);
  }, [id]);

  return (
    <>
      <NavBar />
      <div className="container py-5">
        <div className="top-image">
          {event && (
            <img
              src={event.coverImageUrl || "/placeholder-event.jpg"}
              className="card-img-top"
              alt={event.title}
              style={{
                height: "180px",
                objectFit: "cover",
              }}
            />
          )}
        </div>

        <section className="content-area">
          {event && <Ticket event={event} />}

          <div className="container pt-5">
            <h2>Main Content</h2>
            <p>Page content goes here...</p>
          </div>
        </section>
      </div>
    </>
  );
}

export default EventElements;
