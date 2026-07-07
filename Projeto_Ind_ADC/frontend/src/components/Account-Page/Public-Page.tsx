import { useParams, useNavigate } from "react-router-dom";
import { getUser } from "../../api/auth";
import type { UserInformationResponse } from "../../utils/types";
import NavBar from "../NavBar/NavBar";
import { useState, useEffect } from "react";
import settings_w from "../../assets/icons/settings_w.svg";
import account_profile_green2 from "../../assets/icons/account_circle_green2.svg";
import { sdgInfos } from "../../utils/sdgInfo";
import AccountEvents from "./Account-Events";
import { getEventList } from "../../api/auth";
import type { EventItem, EventListResponse } from "../../utils/types";
import EventCardSmall from "../Events-Page/Event-Card-Small";
import { useAuth } from "../AuthContext";
import EventCard from "../Events-Page/Event-Card";

function PublicPage() {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<UserInformationResponse>();
  const navigate = useNavigate();
  const sdgs = [1, 10, 17];
  const value = [25, 50, 75];

  const loadUser = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }
      if (!username) {
        console.log("Invalid username");
        return;
      }

      const res: UserInformationResponse = await getUser({
        token: { jwt: token },
        input: {
          username: "gg",
        },
      });
      console.log(res);
      setUser(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const [events, setEvents] = useState<EventItem[]>([]); //Events got from the request
  const [nextCursor, setNextCursor] = useState<string | undefined>(); //string means there is cursos to next page, undifined means there is no cursor
  const [loading, setLoading] = useState(false); //if the main page is being loaded
  const [loadingMore, setLoadingMore] = useState(false); //if all the events are being loaded
  const [error, setError] = useState<string | null>(null);

  //============== Get the events =============
  const loadEvents = async (cursor?: string) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }
      if (!username) {
        console.log("Invalid username");
        return;
      }

      console.log(username);

      const res: EventListResponse = await getEventList({
        token: { jwt: token },
        input: {
          organizerUsername: username,
          pageSize: 10,
          cursor: cursor ?? undefined,
        },
      });

      console.log(res.data.events);

      if (cursor) {
        setEvents((prev) => [...prev, ...res.data.events]); //carregar mais => anteriores mais todos os restantes
      } else {
        setEvents(res.data.events);
      }

      setNextCursor(res.data.nextCursor);
    } catch (err) {
      console.error(err);
      setError("Could not load the events.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  //fetch on page render
  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <>
      <NavBar />
      <div className="container py-5">
        <div className="row">
          <div className="d-flex justify-content-end mb-2">
            <img
              src={settings_w}
              alt="Settings"
              onClick={() => navigate("/account/settings")}
              style={{
                width: "24px",
                height: "24px",
                cursor: "pointer",
              }}
            />
          </div>
        </div>

        <div
          className="rounded-4 overflow-hidden"
          style={{ background: "var(--color-white)" }}
        >
          <div
            className="p-4 rounded-top-4"
            style={{ background: "var(--color-green2)" }}
          >
            <div className="d-flex align-items-center">
              <img
                src={account_profile_green2}
                alt="Avatar"
                className="rounded-circle"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                }}
              />

              <div className="ms-4 flex-grow-1">
                <h4 className="mb-0 text-white fw-bold">Display Name</h4>
                <div className="text-white">Username</div>
              </div>

              <div className="d-flex gap-3">
                <button className="btn btn-success px-4">Friend</button>
              </div>
            </div>
          </div>

          <div className="p-4">
            <h5
              className="fw-bold mb-3"
              style={{ color: "var(--color-green)" }}
            >
              Biography
            </h5>

            <p className="mb-0">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam
              eget ligula eu lectus lobortis condimentum. Aliquam nonummy auctor
              massa. Pellentesque habitant morbi tristique senectus et netus et
              malesuada fames ac turpis egestas. Nulla at risus.
            </p>
          </div>
        </div>

        <div
          className="rounded-4 h-100 p-3 mt-5"
          style={{ background: "var(--color-white)" }}
        >
          <div className="row">
            <h5
              className="fw-bold mb-3"
              style={{ color: "var(--color-green)" }}
            >
              User Events:
              <div className="mb-3 mt-3">
                {loading && (
                  <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {!loading && !error && events.length === 0 && (
                  <div className="alert alert-ligth" role="alert">
                    There is no events availables.
                  </div>
                )}

                {!loading && events.length > 0 && (
                  <>
                    <div className="row g-3">
                      {events.slice(0, 3).map((e) => (
                        <div key={e.eventId} className="col-md-4">
                          <EventCard event={e} />
                        </div>
                      ))}
                    </div>

                    <div className="text-center mt-4">
                      <button
                        className="btn"
                        onClick={() => navigate(`/events/${username}`)}
                        style={{
                          background: "var(--color-green)",
                          color: "var(--color-white)",
                        }}
                      >
                        View All Events
                      </button>
                    </div>
                  </>
                )}
              </div>
            </h5>
          </div>
        </div>

        <div
          className="rounded-4 h-100 p-3 mt-5"
          style={{ background: "var(--color-white)" }}
        >
          <h5 className="fw-bold mb-3" style={{ color: "var(--color-green)" }}>
            SDG Analitcs
          </h5>
          {sdgs.map((id, i) => (
            <div key={id} className="d-flex align-items-center mb-3">
              <img
                src={sdgInfos[id - 1].image}
                alt="sdg"
                style={{
                  width: "25px",
                  height: "25px",
                  objectFit: "cover",
                }}
              />

              <div
                className="progress flex-grow-1 ms-3"
                role="progressbar"
                aria-label={`SDG ${id}`}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="progress-bar"
                  style={{
                    width: `${value[i]}%`,
                    backgroundColor: `var(--color-ods${id})`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default PublicPage;
