import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../NavBar/NavBar";
import type {
  Attendee,
  EventAttendeesResponse,
  EventGetterResponse,
  EventItem,
  JoinRequests,
  JoinRequestsResponse,
  KickUserResponse,
  RequestEventGetter,
  RespondJoinResponse,
  UserInformationResponse,
} from "../../utils/types";
import {
  attendeesEvent,
  getEvent,
  getUser,
  kickUser,
  requestsJoinEvent,
  respondJoinEvent,
} from "../../api/auth";
import personPin_w from "../../assets/icons/person_pin_w.svg";
import check_w from "../../assets/icons/check_w.svg";
import close_w from "../../assets/icons/close_white.svg";
import { useNotification } from "../NotificationContext";
import Footer from "../NavBar/Footer";

function EventJoins() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [event, setEvent] = useState<EventItem>();
  const [requests, setRequests] = useState<JoinRequests[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [managedUser, setManagedUser] = useState<Attendee | null>(null);
  const [user, setUser] = useState<UserInformationResponse>();
  const [confirmKick, setConfirmKick] = useState(false);

  const loadRequests = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token || !id) {
        console.log("User is not authenticated");
        return;
      }

      const res: JoinRequestsResponse = await requestsJoinEvent({
        token: { jwt: token },
        input: { eventId: id },
      });

      const fetchedRequests = res.data.requests;

      setRequests(fetchedRequests);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAttends = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token || !id) {
        console.log("User is not authenticated");
        return;
      }

      const res: EventAttendeesResponse = await attendeesEvent({
        token: { jwt: token },
        input: { eventId: id },
      });

      const fetchedAttendees = res.data.attendees;

      if (fetchedAttendees && fetchedAttendees.length > 0) {
        handleManagedUser(fetchedAttendees[0]);
      }

      setAttendees(fetchedAttendees);
    } catch (err) {
      console.error(err);
    }
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

    console.log(res.data.event);
  };

  const loadUser = async (user: string) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }
      if (!user) {
        console.log("Invalid username");
        return;
      }

      const res: UserInformationResponse = await getUser({
        token: { jwt: token },
        input: {
          username: user,
        },
      });
      console.log(res);
      setUser(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleManagedUser = (user: Attendee) => {
    if (!user) return;
    setManagedUser(user);
    loadUser(user.username);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  //============ Handles ================

  const handleRespond = async (username: string, accept: boolean) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }
      if (!username || !id) {
        console.log("Invalid username or event id");
        return;
      }

      const res: RespondJoinResponse = await respondJoinEvent({
        token: { jwt: token },
        input: {
          eventId: id,
          username: username,
          accept: accept,
        },
      });
      console.log(res.data.message);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleKick = async (username: string) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }
      if (!username || !id) {
        console.log("Invalid username or event id");
        return;
      }

      const res: KickUserResponse = await kickUser({
        token: { jwt: token },
        input: {
          eventId: id,
          username: username,
        },
      });
      console.log(res.data.message);
      window.location.reload();
      if (res.status === 200) {
        notify("USER_KICKED");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadRequests();
    loadAttends();
    if (!id) return;
    loadEvents(id);
  }, [id]);

  const showRequestsColumn = event && !event.isPublic;
  const mainColumnClass = showRequestsColumn
    ? "col-12 col-lg-4"
    : "col-12 col-lg-6";

  return (
    <>
      <NavBar />

      <main
        className="container-fluid py-4 py-md-5 px-3 px-md-4"
        style={{ background: "var(--color-white)" }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12">
              <button
                type="button"
                className="btn p-0 mb-3"
                style={{
                  color: "var(--color-green)",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/events/" + id)}
              >
                ← Event Page
              </button>

              <h1
                className="fw-bold mb-3 fs-3 fs-md-1"
                style={{
                  color: "var(--color-green)",
                }}
              >
                Event Joins Management:
              </h1>

              <div className="row g-4">
                {showRequestsColumn && (
                  <div className="col-12 col-lg-4">
                    <h4 className="fs-5">Users Join Requests:</h4>

                    <div
                      className="container-fluid border rounded p-3"
                      style={{
                        maxHeight: "500px",
                        overflowY: "auto",
                      }}
                    >
                      {requests.length === 0 && (
                        <div
                          className="alert alert-light"
                          style={{ color: "var(--color-green)" }}
                          role="alert"
                        >
                          No requests.
                        </div>
                      )}

                      {requests.length !== 0 &&
                        requests.map((req) => (
                          <div
                            key={req.requester}
                            className="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-3 p-3 p-md-4 rounded mt-2"
                            style={{
                              width: "100%",
                              backgroundColor: "var(--color-green2)",
                              color: "var(--color-white)",
                            }}
                          >
                            <div className="w-100">
                              <div>
                                <span className="fw-semibold">Username: </span>
                                <span className="text-break">
                                  {req.requester}
                                </span>
                              </div>

                              <div>
                                <span className="fw-semibold">
                                  Requested At:{" "}
                                </span>
                                <span>{formatDate(req.requestedAt)}</span>
                              </div>
                            </div>

                            <div className="d-flex flex-row flex-sm-column gap-3 align-items-center">
                              <img
                                src={personPin_w}
                                alt="View Profile"
                                onClick={() =>
                                  navigate("/profile/" + req.requester)
                                }
                                style={{ cursor: "pointer", width: "24px" }}
                              />

                              <img
                                src={check_w}
                                alt="Accept"
                                onClick={() =>
                                  handleRespond(req.requester, true)
                                }
                                style={{ cursor: "pointer", width: "24px" }}
                              />

                              <img
                                src={close_w}
                                alt="Decline"
                                onClick={() =>
                                  handleRespond(req.requester, false)
                                }
                                style={{ cursor: "pointer", width: "24px" }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className={mainColumnClass}>
                  <h4 className="fs-5">Users Joined:</h4>

                  <div
                    className="container-fluid border rounded p-3"
                    style={{
                      maxHeight: "500px",
                      overflowY: "auto",
                    }}
                  >
                    {attendees.length === 0 && (
                      <div
                        className="alert alert-light"
                        style={{ color: "var(--color-green)" }}
                        role="alert"
                      >
                        No attendees.
                      </div>
                    )}

                    {attendees.length !== 0 &&
                      attendees.map((attendee) => (
                        <div
                          key={attendee.username}
                          className="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-3 p-3 p-md-4 rounded mt-2"
                          style={{
                            width: "100%",
                            backgroundColor:
                              managedUser?.username === attendee.username
                                ? "var(--color-green)"
                                : "var(--color-green2)",
                            color: "var(--color-white)",
                            cursor: "pointer",
                          }}
                          onClick={() => handleManagedUser(attendee)}
                        >
                          <div className="w-100">
                            <div>
                              <span className="fw-semibold">Username: </span>
                              <span className="text-break">
                                {attendee.username}
                              </span>
                            </div>

                            <div>
                              <span className="fw-semibold">Joined At: </span>
                              <span>{formatDate(attendee.joinedAt)}</span>
                            </div>
                          </div>

                          <div className="d-flex flex-row flex-sm-column gap-3 align-items-center">
                            <img
                              src={personPin_w}
                              alt="View Profile"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate("/profile/" + attendee.username);
                              }}
                              style={{ cursor: "pointer", width: "24px" }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className={mainColumnClass}>
                  <h4 className="fs-5">User Manage:</h4>

                  {!user && (
                    <div
                      className="alert alert-light"
                      style={{ color: "var(--color-green)" }}
                      role="alert"
                    >
                      No users to manage.
                    </div>
                  )}

                  {user && (
                    <div
                      className="rounded-3 p-3"
                      style={{
                        background:
                          managedUser?.username === event?.organizerUsername
                            ? "var(--color-gold)"
                            : "var(--color-green2)",
                      }}
                    >
                      <div>
                        <span className="fw-semibold text-white">
                          Username:{" "}
                        </span>
                        <span className="text-white text-break">
                          {user.data.username || "No username"}
                        </span>
                      </div>

                      <div>
                        <span className="fw-semibold text-white">
                          Displayed Name:{" "}
                        </span>
                        <span className="text-white text-break">
                          {user.data.display || "No displayed username"}
                        </span>
                      </div>

                      <div>
                        <span className="fw-semibold text-white">Email: </span>
                        <span className="text-white text-break">
                          {user.data.email || "No email"}
                        </span>
                      </div>

                      <div>
                        <span className="fw-semibold text-white">Role: </span>
                        <span className="text-white">
                          {user.data.role || "No role"}
                        </span>
                      </div>

                      <div>
                        <span className="fw-semibold text-white">From: </span>
                        <span className="text-white">
                          {user.data.country || "No country"}
                        </span>
                      </div>

                      <div className="row mt-3">
                        <div className="col-12">
                          {managedUser?.username ===
                            event?.organizerUsername && (
                            <div
                              className="rounded-3 fw-bold px-4 py-2 text-center text-md-start"
                              style={{ background: "var(--color-white)" }}
                            >
                              Event Organizer
                            </div>
                          )}

                          {!confirmKick &&
                            managedUser?.username !==
                              event?.organizerUsername && (
                              <button
                                type="button"
                                className="btn btn-danger fw-bold px-4 w-100 w-md-auto"
                                onClick={() => setConfirmKick(true)}
                              >
                                Kick {user.data.username}
                              </button>
                            )}

                          {confirmKick && managedUser && (
                            <div className="d-flex flex-column flex-sm-row gap-2">
                              <button
                                type="button"
                                className="btn btn-danger fw-bold"
                                onClick={() => setConfirmKick(false)}
                              >
                                Cancel
                              </button>

                              <button
                                type="button"
                                className="btn fw-bold"
                                style={{
                                  background: "var(--color-green)",
                                  color: "var(--color-white)",
                                }}
                                onClick={() => handleKick(managedUser.username)}
                              >
                                Confirm
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default EventJoins;
