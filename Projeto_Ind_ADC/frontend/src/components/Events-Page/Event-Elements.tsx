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
import placeholder from "../../assets/images/placeholder.png";
import "./Event-Elements.css";
import { useAuth } from "../AuthContext";

function EventElements() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventItem | undefined>();
  //const { isAuthenticated, username } = useAuth();

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
                  Event Descriprion:
                </h2>
                <p className="mb-1" style={{ color: "var(--color-white)" }}>
                  {event?.description}
                </p>
              </div>
              <div className="col-4"></div>
            </div>
            <div className="row pt-5">
              <h2 style={{ color: "var(--color-white)" }}>
                Event Photo Collection:
              </h2>
              {event?.imageUrls &&
                event.imageUrls.map((url) => <img src={url} />)}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default EventElements;
