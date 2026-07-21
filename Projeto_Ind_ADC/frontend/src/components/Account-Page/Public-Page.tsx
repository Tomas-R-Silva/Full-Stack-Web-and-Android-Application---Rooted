import { useParams, useNavigate } from "react-router-dom";
import { addNickName, getNickName, getUser } from "../../api/auth";
import type {
  AddNicknameResponse,
  GetNicknameResponse,
  UserInformationResponse,
} from "../../utils/types";
import NavBar from "../NavBar/NavBar";
import { useState, useEffect } from "react";
import settings_w from "../../assets/icons/settings_w.svg";
import account_circle_w from "../../assets/icons/account_circle_w.svg";
import { getBorderItem } from "../../utils/borders";
import { sdgInfos } from "../../utils/sdgInfo";
import { getEventList } from "../../api/auth";
import type { EventItem, EventListResponse } from "../../utils/types";
import type { AddFriendResponse } from "../../utils/types";
import type { UnfriendResponse } from "../../utils/types";
import EventCard from "../Events-Page/Event-Card";
import { addFriend, unfriend } from "../../api/auth";
import verified from "../../assets/icons/verified_w.svg";
import { useNotification } from "../NotificationContext";
import Footer from "../NavBar/Footer";

function PublicPage() {
  const { username } = useParams<{ username: string }>();
  const { notify } = useNotification();
  const [nickname, setNickname] = useState<string>("");
  const [showNicknameInput, setShowNicknameInput] = useState<boolean>(false);
  const [user, setUser] = useState<UserInformationResponse>();
  const [sdgs, setSdgs] = useState<{ id: number; value: number }[]>([]);
  const maxValue = sdgs.length ? sdgs[0].value : 1;
  const navigate = useNavigate();

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

  const handleAddNickname = async () => {
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

      const res: AddNicknameResponse = await addNickName({
        token: { jwt: token },
        input: {
          username: username,
          newName: nickname,
        },
      });
      console.log(res.data.message);
      window.location.reload();
      if (res.status === 200) {
        notify("NICKNAME_ADDED");
      }
    } catch (err) {
      console.error(err);
    }
  };

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
      if (res.status === 200) {
        if (res.data.message.includes("Sent")) {
          notify("FRIEND_REQUEST_SENDED");
        }
        if (res.data.message.includes("Accepted")) {
          notify("FRIEND_REQUEST_ACCEPTED");
        }
      }
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
      if (res.status === 200) {
        notify("UNFRIEND");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadNickname = async (friend: string) => {
    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        console.log("User is not authenticated");
        return;
      }

      if (!friend) {
        console.log("Invalid username");
        return;
      }

      const res: GetNicknameResponse = await getNickName({
        token: { jwt: token },
        input: { username: friend },
      });

      console.log(res);

      setNickname(res.data.nickname ?? "");
    } catch (err) {
      console.error(err);
    }
  };

  const longToVisualDate = (date: number) => {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getProfileName = () => {
    if (!user) return "";

    const displayName = user.data.display || user.data.username;

    if (user.data.friendship === "FRIENDS" && nickname.trim() !== "") {
      return `${nickname.trim()}`;
    }

    return displayName;
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    loadUser();
  }, [username]);

  useEffect(() => {
    if (!user) return;

    if (user.data.friendship === "FRIENDS") {
      loadNickname(user.data.username);
    } else {
      setNickname("");
    }
  }, [user]);

  return (
    <>
      <NavBar />
      <div className="container py-5">
        <div
          className="rounded-4 overflow-hidden"
          style={{ background: "var(--color-white)" }}
        >
          <div
            className="p-3 p-md-4 rounded-top-4"
            style={{ background: "var(--color-green2)" }}
          >
            <div className="d-flex flex-column flex-lg-row align-items-center align-items-lg-center gap-4">
              <div
                style={{
                  position: "relative",
                  width: "80px",
                  height: "80px",
                  minWidth: "80px",
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

              <div className="text-center text-lg-start flex-grow-1 w-100">
                <div className="row g-3 align-items-center">
                  <div className="col-12 col-md-6 col-xl-3">
                    <h4 className="mb-0 text-white fw-bold">
                      {getProfileName()}

                      {user?.data.role === "PARTNER" && (
                        <img className="ms-1" src={verified} alt="Verified" />
                      )}
                    </h4>

                    <div className="text-white mt-2">
                      {user && user.data.username}
                    </div>
                  </div>

                  <div className="col-12 col-md-6 col-xl-3">
                    <div className="text-white">Email:</div>
                    <h6 className="mb-0 text-white text-break">
                      {user && user.data.email}
                    </h6>
                  </div>

                  <div className="col-12 col-md-6 col-xl-2">
                    <div className="text-white">Role:</div>
                    <h6 className="mb-0 text-white">
                      {user && user.data.role}
                    </h6>
                  </div>

                  <div className="col-12 col-md-6 col-xl-3">
                    <div className="text-white">Member since:</div>
                    <h6 className="mb-0 text-white">
                      {user && longToVisualDate(user.data.creation_time)}
                    </h6>
                  </div>
                </div>
              </div>

              <div className="d-flex flex-column flex-sm-row flex-wrap gap-2 justify-content-center justify-content-lg-end align-items-center">
                {user && user.data.friendship === "SELF" && (
                  <img
                    src={settings_w}
                    alt="Settings"
                    onClick={() => navigate("/account/settings")}
                    style={{
                      width: "55px",
                      height: "55px",
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
                  <div className="d-flex flex-column flex-sm-row flex-wrap gap-2 align-items-center justify-content-center">
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

                    <button
                      className="btn px-4"
                      style={{
                        background: "var(--color-white)",
                        color: "var(--color-green)",
                        border: "1px solid var(--color-green)",
                      }}
                      onClick={() => setShowNicknameInput((prev) => !prev)}
                    >
                      Nickname
                    </button>

                    {showNicknameInput && (
                      <>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nickname"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          style={{
                            width: "100%",
                            maxWidth: "180px",
                          }}
                        />

                        <button
                          className="btn"
                          style={{
                            background: "var(--color-green)",
                            color: "var(--color-white)",
                          }}
                          onClick={handleAddNickname}
                        >
                          Save
                        </button>
                      </>
                    )}
                  </div>
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
                  ? "This user hasn't had any previous names."
                  : user.data.oldnames.join(", ")}
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
                  : user.data.category.join(", ")}
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
          {sdgs.some(({ value }) => value > 0) ? (
            sdgs
              .filter(({ value }) => value > 0)
              .map(({ id, value }) => (
                <div key={id} className="d-flex align-items-center mb-3">
                  <img
                    src={sdgInfos[id - 1].image}
                    alt={`SDG ${id}`}
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
                        width: `${(value / maxValue) * 100}%`,
                        backgroundColor: `var(--color-ods${id})`,
                      }}
                    />
                  </div>
                </div>
              ))
          ) : (
            <p className="mb-0 text-muted">
              This user hasn't participated in any events yet.
            </p>
          )}
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
                        onClick={() => navigate(`/events`)}
                        style={{
                          background: "var(--color-white)",
                          color: "var(--color-green)",
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
      <Footer />
    </>
  );
}

export default PublicPage;
