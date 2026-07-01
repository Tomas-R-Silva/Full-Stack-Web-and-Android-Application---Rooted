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
import placeholder from "../../assets/images/photo1.png";
import "./Event-Elements.css";

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
      <div className="hero-wrapper">
        <div className="top-image">
          {event && (
            <img src={event.coverImageUrl || placeholder} alt={event.title} />
          )}
        </div>

        {event && (
          <div className="ticket-wrapper">
            <Ticket event={event} />
          </div>
        )}
        <section className="content-area">
          <div className="container pt-5">
            <div className="row">
              <div className="col-8">
                <h2 style={{ color: "var(--color-white)" }}>
                  Event Descriprion
                </h2>
                <p className="mb-1" style={{ color: "var(--color-white)" }}>
                  {event?.description}
                </p>
              </div>
              <div className="col-4"></div>
            </div>
            <div className="row pt-5">
              <h2 style={{ color: "var(--color-white)" }}>
                Event photo collection:
              </h2>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default EventElements;
