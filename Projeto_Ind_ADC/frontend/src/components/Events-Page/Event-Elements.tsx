import NavBar from "../NavBar/NavBar";
import Ticket from "./Ticket";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type {
  RequestEventGetter,
  EventGetterResponse,
  EventItem,
  RequestEventUpdate,
} from "../../utils/types";
import { getEvent } from "../../api/auth";
import placeholder from "../../assets/images/placeholder.png";
import "./Event-Elements.css";
import { useAuth } from "../AuthContext";
import editSquare_w from "../../assets/icons/edit_square_white.svg";
import EventUpdater from "./Event-Updater";
import Chat from "../Forum-elements/Chat";

function EventElements() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventItem | undefined>();
  const { isAuthenticated, username } = useAuth();
  const [showModal, setShowModal] = useState(false);
  type UpdateField = keyof RequestEventUpdate["input"];
  const [field, setField] = useState<UpdateField>("title");

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

  const handleUpdate = (newField: any) => {
    setShowModal(true);
    setField(newField);
  };

  const UpdateProps = {
    onClose: () => setShowModal(false),
    event,
    field,
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
        {isAuthenticated && event && event.organizerUsername === username && (
          <img
            className="edit-icon"
            src={editSquare_w}
            onClick={() => handleUpdate("coverImageUrl")}
            style={{ cursor: "pointer" }}
          />
        )}

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
                  Event Descriprion:{" "}
                  {isAuthenticated &&
                    event &&
                    event.organizerUsername === username && (
                      <img
                        src={editSquare_w}
                        onClick={() => handleUpdate("description")}
                        style={{ cursor: "pointer" }}
                      />
                    )}
                </h2>
                <p className="mb-1" style={{ color: "var(--color-white)" }}>
                  {event?.description}
                </p>
              </div>
              <div className="col-4">
                <h2 style={{ color: "var(--color-white)" }}>
                  Event Organizer:
                </h2>
                <p style={{ color: "var(--color-white)" }}>
                  {event?.organizerUsername}
                </p>
              </div>
            </div>
            <div className="row mt-5">
              <div className="col-8">
                <h2 style={{ color: "var(--color-white)" }}>
                  Event Photo Collection:
                </h2>

                <div className="photo-collection">
                  {event?.imageUrls?.map((url, index) => (
                    <img key={index} src={url} alt={`Event ${index + 1}`} />
                  ))}
                </div>
              </div>

              <div className="col-4">
                <h2 style={{ color: "var(--color-white)" }}>Event Location:</h2>
                {/* map here */}
              </div>
            </div>
            <div className="row mt-5">
              <h2 style={{ color: "var(--color-white)" }}>Event Chat:</h2>
              {event && <Chat event={event} />}
            </div>
          </div>
        </section>
        {showModal && event && (
          <EventUpdater
            onClose={() => setShowModal(false)}
            event={event}
            field={field}
          />
        )}
      </div>
    </>
  );
}

export default EventElements;
