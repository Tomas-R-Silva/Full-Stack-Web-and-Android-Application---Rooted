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
import { useAuth } from "../AuthContext";
import editSquare_w from "../../assets/icons/edit_square_white.svg";
import manageAccounts_w from "../../assets/icons/manage_accounts_w.svg";
import Chat from "../Forum-elements/Chat";
import { useMapsPage } from "../../api/maps";
import { getUser } from "../../api/auth";
import type { UserInformationResponse } from "../../utils/types";
import account_circle_w from "../../assets/icons/account_circle_w.svg";
import person_pin from "../../assets/icons/person_pin_w.svg";
import verified from "../../assets/icons/verified_w.svg";
import { getBorderItem } from "../../utils/borders";
import Footer from "../NavBar/Footer";
import NotFound from "../NotFound";

function EventElements() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventItem | undefined>();
  const { isAuthenticated, username } = useAuth();
  const eventMapRef = useRef<HTMLDivElement | null>(null);
  const { renderEventMap } = useMapsPage(import.meta.env.VITE_API_KEY);
  const [user, setUser] = useState<UserInformationResponse>();
  const navigate = useNavigate();
  const [sdgs, setSdgs] = useState<{ id: number; value: number }[]>([]);
  const [notFound, setNotFound] = useState(false);

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

    const request: RequestEventGetter = {
      token: { jwt: token ?? "" },
      input: { eventId: id },
    };

    const res: EventGetterResponse = await getEvent(request);

    if (res.status === 9902) {
      setNotFound(true);
      return;
    }

    setEvent(res.data.event);
    loadUser(res.data.event.organizerUsername);
  };

  useEffect(() => {
    if (!id) return;
    loadEvents(id);
  }, [id]);

  useEffect(() => {
    if (!event || !eventMapRef.current) return;

    renderEventMap(event, eventMapRef.current);
  }, [event, renderEventMap]);

  if (notFound) {
    return <NotFound />;
  }

  if (!isAuthenticated) {
    return (
      <>
        <NavBar />
        <div className="container-fluid px-2 px-sm-3 px-md-4 my-2">
          <div
            className="alert alert-light mt-5"
            style={{ color: "var(--color-green)" }}
            role="alert"
          >
            You need to be logged in to see the event details.
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />

      <div className="container-fluid px-2 px-sm-3 px-md-4 my-2">
        <div className="d-flex justify-content-between align-items-center gap-3">
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
            <div className="d-flex gap-3 flex-shrink-0">
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

      <div style={{ position: "relative" }}>
        <div
          style={{
            width: "100%",
            height: "clamp(220px, 38vw, 400px)",
            overflow: "hidden",
          }}
        >
          {event && (
            <img
              src={event.imageUrls?.[0]?.url ?? placeholder}
              alt={event.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          )}
        </div>

        {event && (
          <div
            className="container-fluid px-2 px-sm-3 px-md-4"
            style={{
              position: "relative",
              zIndex: 10,
              marginTop: "clamp(-120px, -10vw, -70px)",
            }}
          >
            <Ticket event={event} />
          </div>
        )}

        <section
          style={{
            paddingTop: "clamp(32px, 5vw, 70px)",
            minHeight: "800px",
          }}
        >
          <div className="container px-3 px-md-4">
            <div className="row g-4">
              <div className="col-12 col-lg-8">
                <h2
                  style={{
                    color: "var(--color-white)",
                    fontSize: "clamp(1.5rem, 3vw, 2rem)",
                  }}
                >
                  Event Description:
                </h2>

                <p
                  className="mb-1"
                  style={{
                    color: "var(--color-white)",
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                  }}
                >
                  {event?.description}
                </p>
              </div>

              <div className="col-12 col-lg-4">
                <h2
                  style={{
                    color: "var(--color-white)",
                    fontSize: "clamp(1.5rem, 3vw, 2rem)",
                  }}
                >
                  Event Organizer:
                </h2>

                <div
                  className="rounded-3 px-3 py-3 d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3"
                  style={{
                    background: "var(--color-green2)",
                    width: "100%",
                  }}
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
                      src={user?.data?.avatar?.url?.trim() || account_circle_w}
                      alt="Avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />

                    {user && user.data.borderID && (
                      <img
                        src={getBorderItem(user.data.borderID)?.image}
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
                    )}
                  </div>

                  <div
                    className="flex-grow-1"
                    style={{
                      minWidth: 0,
                    }}
                  >
                    <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2">
                      <h5
                        className="mb-0 fw-bold"
                        style={{
                          color: "var(--color-white)",
                          overflowWrap: "anywhere",
                          wordBreak: "break-word",
                        }}
                      >
                        {user?.data.username || "Deleted account"}

                        {user?.data.role === "PARTNER" && (
                          <img
                            className="ms-1"
                            src={verified}
                            alt="Verified partner"
                            style={{
                              width: "16px",
                              height: "16px",
                            }}
                          />
                        )}
                      </h5>

                      <div className="d-flex gap-1 flex-wrap">
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
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                        display: "block",
                      }}
                    >
                      {user?.data.email || "Deleted account"}
                    </small>
                  </div>

                  <img
                    src={person_pin}
                    alt="Open organizer profile"
                    onClick={() => {
                      if (user?.data.username) {
                        navigate("/profile/" + user.data.username);
                      }
                    }}
                    style={{
                      width: "36px",
                      height: "36px",
                      cursor: user?.data.username ? "pointer" : "default",
                      flexShrink: 0,
                      alignSelf: "center",
                    }}
                  />
                </div>

                <h2
                  className="mt-4"
                  style={{
                    color: "var(--color-white)",
                    fontSize: "clamp(1.5rem, 3vw, 2rem)",
                  }}
                >
                  Event Partners:
                </h2>

                <p
                  className="mb-1"
                  style={{
                    color: "var(--color-white)",
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                  }}
                >
                  {event && event.partners && event.partners.length !== 0
                    ? event.partners
                    : "This event has no partners."}
                </p>
              </div>
            </div>

            <div className="row g-4 mt-4 mt-md-5">
              <div className="col-12 col-lg-8">
                <h2
                  style={{
                    color: "var(--color-white)",
                    fontSize: "clamp(1.5rem, 3vw, 2rem)",
                  }}
                >
                  Event Photo Collection:
                </h2>

                <div className="row g-3">
                  {event?.imageUrls?.length === 0 && (
                    <div className="col-12">
                      <p style={{ color: "var(--color-white)" }}>
                        No images available.
                      </p>
                    </div>
                  )}

                  {event?.imageUrls?.map((image, index) => (
                    <div key={image.id} className="col-12 col-sm-6 col-xl-4">
                      <img
                        src={image.url}
                        alt={`Event ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "220px",
                          borderRadius: "8px",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-12 col-lg-4">
                <h2
                  style={{
                    color: "var(--color-white)",
                    fontSize: "clamp(1.5rem, 3vw, 2rem)",
                  }}
                >
                  Event Location:
                </h2>

                <div
                  ref={eventMapRef}
                  style={{
                    width: "100%",
                    height: "clamp(260px, 40vw, 300px)",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                />
              </div>
            </div>

            <div className="row mt-4 mt-md-5">
              <div className="col-12">
                <h2
                  style={{
                    color: "var(--color-white)",
                    fontSize: "clamp(1.5rem, 3vw, 2rem)",
                  }}
                >
                  Event Chat:
                </h2>

                {event && <Chat event={event} />}
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

export default EventElements;
