import { useParams, useNavigate } from "react-router-dom";
import { getUser } from "../../api/auth";
import type { UserInformationResponse } from "../../utils/types";
import NavBar from "../NavBar/NavBar";
import { useState, useEffect } from "react";
import settings_w from "../../assets/icons/settings_w.svg";
import account_circle_w from "../../assets/icons/account_circle_w.svg";
import border_1 from "../../assets/images/border_1.png";
import { sdgInfos } from "../../utils/sdgInfo";
import AccountEvents from "./Account-Events";
import { getEventList } from "../../api/auth";
import type { EventItem, EventListResponse } from "../../utils/types";
import type { RequestAddFriend, AddFriendResponse } from "../../utils/types";
import type { RequestUnfriend, UnfriendResponse } from "../../utils/types";
import { useAuth } from "../AuthContext";
import EventCard from "../Events-Page/Event-Card";
import { addFriend, unfriend } from "../../api/auth";

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
          username: username,
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
        input: {
          category: null,
          status: null,
          organizerUsername: username,
          pageSize: 10,
          cursor: cursor ?? null,
          isAccessible: null,
          sdg: [],
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

  const handleAddfriend = async (friendToAdd: string) => {
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

      const res: AddFriendResponse = await addFriend({
        token: { jwt: token },
        input: { username: friendToAdd },
      });
      console.log(res.data.message);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnfriend = async (friendToDelete: string) => {
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

      const res: UnfriendResponse = await unfriend({
        token: { jwt: token },
        input: { username: friendToDelete },
      });
      console.log(res.data.message);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const longToVisualDate = (date: number) => {
    return new Date(date / 1000).toLocaleString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <>
      <NavBar />
      <div className="container py-5">
        <div
          className="rounded-4 overflow-hidden"
          style={{ background: "var(--color-white)" }}
        >
          <div
            className="p-4 rounded-top-4"
            style={{ background: "var(--color-green2)" }}
          >
            <div className="d-flex align-items-center">
              <div
                style={{
                  position: "relative",
                  width: "48px",
                  height: "48px",
                }}
              >
                <img
                  src={account_circle_w}
                  alt="Avatar"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />

                <img
                  src={border_1}
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

              <div className="ms-4 flex-grow-1">
                <h4 className="mb-0 text-white fw-bold">
                  {user && user.data.display}
                </h4>
                <div className="text-white mt-2">
                  {user && user.data.username}
                </div>
              </div>

              <div className="ms-4 flex-grow-1">
                <div className="text-white ">Email:</div>
                <h6 className="mb-0 text-white">{user && user.data.email}</h6>
              </div>

              <div className="ms-4 flex-grow-1">
                <div className="text-white ">Role:</div>
                <h6 className="mb-0 text-white">{user && user.data.role}</h6>
              </div>

              <div className="ms-4 flex-grow-1">
                <div className="text-white ">Member since:</div>
                <h6 className="mb-0 text-white">
                  {user && longToVisualDate(user.data.creation_time)}
                </h6>
              </div>

              <div className="d-flex gap-3">
                {user && user.data.friendship === "SELF" && (
                  <img
                    src={settings_w}
                    alt="Settings"
                    onClick={() => navigate("/account/settings")}
                    style={{
                      width: "70px",
                      height: "70px",
                      cursor: "pointer",
                    }}
                  />
                )}
                {user && user.data.friendship === "NOT_FRIENDS" && (
                  <button
                    className="btn px-4"
                    style={{
                      background: "var(--color-green)",
                      color: "var(--color-white)",
                    }}
                    onClick={() => handleAddfriend(user.data.username)}
                  >
                    Add Friend
                  </button>
                )}
                {user && user.data.friendship === "FRIENDS" && (
                  <button
                    className="btn px-4"
                    style={{
                      background: "var(--color-green)",
                      color: "var(--color-white)",
                    }}
                    onClick={() => handleUnfriend(user.data.username)}
                  >
                    Unfriend
                  </button>
                )}
                {user && user.data.friendship === "REQUEST_RECIVED" && (
                  <button
                    className="btn px-4"
                    style={{
                      background: "var(--color-green)",
                      color: "var(--color-white)",
                    }}
                    onClick={() => handleAddfriend(user.data.username)}
                  >
                    Accept Request
                  </button>
                )}
                {user && user.data.friendship === "REQUEST_SENT" && (
                  <button
                    className="btn px-4"
                    style={{
                      background: "var(--color-green)",
                      color: "var(--color-white)",
                    }}
                    disabled
                  >
                    Request Sent
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 pt-3 pb-2">
            <h5
              className="fw-bold mb-1"
              style={{ color: "var(--color-green)" }}
            >
              Biography
            </h5>

            <p className="mb-0">{user && user.data.bio}</p>
          </div>
          <div className="px-4 py-2">
            <h5
              className="fw-bold mb-1"
              style={{ color: "var(--color-green)" }}
            >
              Old Names:
            </h5>

            {user && user.data.oldnames && (
              <p className="mb-0">
                {user.data.oldnames.length === 0
                  ? "This user hasn't older names."
                  : user.data.oldnames}
              </p>
            )}
          </div>
          <div className="px-4 py-2">
            <h5
              className="fw-bold mb-1"
              style={{ color: "var(--color-green)" }}
            >
              Interests:
            </h5>

            {user && user.data.category && (
              <p className="mb-0">
                {user.data.category.length === 0
                  ? "This user hasn't interests."
                  : user.data.category}
              </p>
            )}
          </div>
          <div className="mb-2"></div>
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
      </div>
    </>
  );
}

export default PublicPage;
