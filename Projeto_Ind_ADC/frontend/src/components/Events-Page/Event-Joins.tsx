import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../NavBar/NavBar";
import type {
  JoinRequests,
  JoinRequestsResponse,
  RespondJoinResponse,
} from "../../utils/types";
import { requestsJoinEvent, respondJoinEvent } from "../../api/auth";
import personPin_w from "../../assets/icons/person_pin_w.svg";
import check_w from "../../assets/icons/check_w.svg";
import close_w from "../../assets/icons/close_white.svg";

function EventJoins() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<JoinRequests[]>([]);
  const [managedUser, setManagedUser] = useState<JoinRequests | null>(null);

  const loadUsers = async () => {
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

      if (fetchedRequests && fetchedRequests.length > 0) {
        setManagedUser(fetchedRequests[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

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

      if (fetchedRequests && fetchedRequests.length > 0) {
        setManagedUser(fetchedRequests[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleManagedUser = (user: JoinRequests) => {
    setManagedUser(user);
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

  useEffect(() => {
    loadUsers();
    loadRequests();
  }, []);

  return (
    <>
      <NavBar />
      <div
        className="container py-5"
        style={{ background: "var(--color-white)" }}
      >
        <div className="row w-100 justify-content-center">
          <a
            style={{
              color: "var(--color-green)",
              fontSize: "16px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/events/" + id)}
          >
            ← Event Page
          </a>
          <h1
            className="fw-bold mb-3"
            style={{
              color: "var(--color-green)",
            }}
          >
            Event Joins Management:
          </h1>
          <div className="container py-3">
            <div className="row">
              <div className="col-4">
                <h4>Users Join Requests:</h4>
                <div
                  className="container border rounded p-3"
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
                        className="d-flex justify-content-between align-items-start p-4 rounded mt-2"
                        style={{
                          maxWidth: "500px",
                          width: "100%",
                          backgroundColor:
                            managedUser?.requester === req.requester
                              ? "var(--color-green)"
                              : "var(--color-green2)",
                          color: "var(--color-white)",
                          cursor: "pointer",
                        }}
                        onClick={() => handleManagedUser(req)}
                      >
                        <div>
                          <span className="fw-semibold">Username: </span>
                          <span>{req.requester}</span>

                          <div>
                            <span className="fw-semibold">Email: </span>
                            <span>{formatDate(req.requestedAt)}</span>
                          </div>
                        </div>

                        <div
                          className="d-flex flex-column justify-content-between align-items-end"
                          style={{ height: "100%" }}
                        >
                          <img
                            src={personPin_w}
                            alt="View Profile"
                            onClick={() =>
                              navigate("/profile/" + req.requester)
                            }
                            style={{ cursor: "pointer" }}
                          />
                          <img
                            src={check_w}
                            alt="Aceept"
                            onClick={() => handleRespond(req.requester, true)}
                            style={{ cursor: "pointer" }}
                          />
                          <img
                            src={close_w}
                            alt="Decline"
                            onClick={() => handleRespond(req.requester, false)}
                            style={{ cursor: "pointer" }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="col-4">
                <h4>Users Joined:</h4>
              </div>
              <div className="col-4">
                <h4>User Information:</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EventJoins;
