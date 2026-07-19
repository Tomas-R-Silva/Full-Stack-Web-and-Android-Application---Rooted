import NavBar from "../NavBar/NavBar";
import Ticket from "./Ticket";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type {
  RequestEventGetter,
  EventGetterResponse,
  EventItem,
} from "../../utils/types";
import { getEvent } from "../../api/auth";
import placeholder from "../../assets/images/placeholder.png";
import "./Event-Elements.css";
import { useAuth } from "../AuthContext";
import editSquare_w from "../../assets/icons/edit_square_white.svg";
import manageAccounts_w from "../../assets/icons/manage_accounts_w.svg";
import Chat from "../Forum-elements/Chat";
import { useMapsPage } from "../../api/maps";
import { getUser } from "../../api/auth";
import type { UserInformationResponse } from "../../utils/types";
import account_circle from "../../assets/icons/account_circle_green2.svg";
import border_all from "../../assets/images/border_all.png";
import person_pin from "../../assets/icons/person_pin_w.svg";
import verified from "../../assets/icons/verified_w.svg";

function EventElements() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventItem | undefined>();
  const { isAuthenticated, username } = useAuth();
  const eventMapRef = useRef<HTMLDivElement | null>(null);
  const { renderEventMap } = useMapsPage(import.meta.env.VITE_API_KEY);
  const [user, setUser] = useState<UserInformationResponse>();
  const navigate = useNavigate();
  const [sdgs, setSdgs] = useState<{ id: number; value: number }[]>([]);

  const loadUser = async (organizer: string) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }
      if (!organizer) {
        console.log("Invalid username");
        return;
      }

      const res: UserInformationResponse = await getUser({
        token: { jwt: token },
        input: {
          username: organizer,
        },
      });
      console.log(res);
      setUser(res);
      setSdgs(loadSDGAnalitics(res.data.ods));
    } catch (err) {
      console.error(err);
    }
  };

  const loadSDGAnalitics = (sdgs: number[]) => {
    return sdgs
      .map((value, index) => ({
        id: index + 1,
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  };

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

    loadUser(res.data.event.organizerUsername);

    console.log(res.data.event);
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
      <div className="my-2 mx-2">
        <div className="d-flex justify-content-between align-items-center">
          <p
            className="mb-0"
            style={{
              color: "white",
              fontSize: "12px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/events")}
          >
            ← Return to Events
          </p>

          {isAuthenticated && event && event.organizerUsername === username && (
            <div className="d-flex gap-3">
              <img
                src={editSquare_w}
                alt="Edit event"
                onClick={() => navigate(`/events/${id}/edit`)}
                style={{
                  width: "24px",
                  height: "24px",
                  cursor: "pointer",
                }}
              />

              <img
                src={manageAccounts_w}
                alt="Manage participants"
                onClick={() => navigate(`/events/${id}/joins`)}
                style={{
                  width: "24px",
                  height: "24px",
                  cursor: "pointer",
                }}
              />
            </div>
          )}
        </div>
      </div>
      <div className="hero-wrapper">
        <div className="top-image">
          {event && (
            <img
              src={event.imageUrls?.[0]?.url ?? placeholder}
              alt={event.title}
            />
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
                <div
                  className="rounded-3 px-3 py-3 d-flex align-items-center justify-content-between"
                  style={{ background: "var(--color-green2)" }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "80px",
                      height: "80px",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={account_circle}
                      alt="Avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />

                    <img
                      src={border_all}
                      alt=""
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none",
                        userSelect: "none",
                      }}
                    />
                  </div>

                  <div className="flex-grow-1 ms-3">
                    <div className="d-flex align-items-center gap-2">
                      <h5
                        className="mb-0 fw-bold"
                        style={{ color: "var(--color-white)" }}
                      >
                        {user?.data.username || "Deleted account"}
                        {user?.data.role === "PARTNER" && (
                          <img className="ms-1" src={verified} />
                        )}
                      </h5>
                      <div className="d-flex gap-1 ms-3">
                        {sdgs.map(({ id, value }) => (
                          <div
                            key={id}
                            style={{
                              width: "12px",
                              height: "12px",
                              borderRadius: "50%",
                              backgroundColor:
                                value !== 0
                                  ? `var(--color-ods${id})`
                                  : "var(--color-white)",
                              border: `1px solid ${
                                value !== 0
                                  ? `var(--color-ods${id})`
                                  : "var(--color-green)"
                              }`,
                              flexShrink: 0,
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <small
                      style={{
                        color: "var(--color-white)",
                      }}
                    >
                      {user?.data.email || "Deleted account"}
                    </small>
                  </div>

                  <img
                    src={person_pin}
                    alt="Action"
                    onClick={() => navigate("/profile/" + user?.data.username)}
                    style={{
                      width: "36px",
                      height: "36px",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  />
                </div>
                <h2 className="mt-4" style={{ color: "var(--color-white)" }}>
                  Event Partners:
                </h2>
                <p className="mb-1" style={{ color: "var(--color-white)" }}>
                  {event && event.partners && event.partners.length !== 0
                    ? event.partners
                    : "This event has no partners."}
                </p>
              </div>
            </div>
            <div className="row mt-5">
              <div className="col-8">
                <h2 style={{ color: "var(--color-white)" }}>
                  Event Photo Collection:
                </h2>

                <div className="photo-collection">
                  {event?.imageUrls?.length === 0 && (
                    <p style={{ color: "var(--color-white)" }}>
                      No images available.
                    </p>
                  )}

                  {event?.imageUrls?.map((image, index) => (
                    <img
                      key={image.id}
                      src={image.url}
                      alt={`Event ${index + 1}`}
                    />
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
