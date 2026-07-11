import NavBar from "../NavBar/NavBar";
import Ticket from "./Ticket";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
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
import { useMapsPage } from "../../api/maps";

function EventElements() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventItem | undefined>();
  const { isAuthenticated, username } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const eventMapRef = useRef<HTMLDivElement | null>(null);
  const { renderEventMap } = useMapsPage(import.meta.env.VITE_API_KEY);
  type UpdateField = keyof RequestEventUpdate["input"];
  const [field, setField] = useState<UpdateField>("title");
  const navigate = useNavigate();

  const loadEvents = async (id: string) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.log("User is not authenticated");
    }

    const request: RequestEventGetter = {
      token: { jwt: token ?? "" },
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

  useEffect(() => {
    if (!event || !eventMapRef.current) return;

    renderEventMap(event, eventMapRef.current);
  }, [event, renderEventMap]);

  return (
    <>
      <NavBar />
      <div className="hero-wrapper">
        <div className="top-image">
          {event && (
            <img src={event.imageUrls[0] || placeholder} alt={event.title} />
          )}
        </div>
        {isAuthenticated && event && event.organizerUsername === username && (
          <img
            className="edit-icon"
            src={editSquare_w}
            onClick={() => navigate("/events/" + id + "/edit")}
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
                <div
                  ref={eventMapRef}
                  style={{
                    width: "100%",
                    height: "300px",
                    borderRadius: "8px",
                  }}
                />
              </div>
            </div>
            <div className="row mt-5">
              <h2 style={{ color: "var(--color-white)" }}>Event Chat:</h2>
              {event && <Chat event={event} />}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default EventElements;
