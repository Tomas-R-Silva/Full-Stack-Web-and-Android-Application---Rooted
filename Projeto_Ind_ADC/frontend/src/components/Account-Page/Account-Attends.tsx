import type { Attends, UserAttendsResponse } from "../../utils/types";
import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { UserAttends } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import eventUpcoming from "../../assets/icons/event_upcoming_w.svg";

function AccountAttends() {
  //================= Hooks ===================
  const [attends, setAttends] = useState<Attends[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { username } = useAuth();
  const navigate = useNavigate();

  //============== Get the events =============
  const loadAttends = async () => {
    try {
      setLoading(true);

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

      const res: UserAttendsResponse = await UserAttends({
        token: { jwt: token },
        input: {
          username: username,
        },
      });

      setAttends(res.data.myattends);
      console.log(res.data.myattends);
    } catch (err) {
      console.error(err);
      setError("Could not load the events.");
    } finally {
      setLoading(false);
    }
  };

  const longToVisualDate = (date: number) => {
    return new Date(date / 1000).toLocaleString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  //fetch on page render
  useEffect(() => {
    loadAttends();
  }, []);

  return (
    <>
      <div className="container">
        <div className="row w-100 justify-content-center">
          <div className="col-12 col-lg-8">
            <h1 className="fw-bold text-white mb-3">My Attends</h1>

            <p className="text-white mb-4">
              Check all the events that this account is attending.
            </p>

            <div className="mb-3">
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

              {!loading && !error && attends.length === 0 && (
                <div
                  className="alert alert-light"
                  style={{ color: "var(--color-green)" }}
                  role="alert"
                >
                  You are not attending to any event at this moment.
                </div>
              )}

              {!loading && attends.length > 0 && (
                <>
                  {attends.map((attend) => (
                    <div
                      key={attend.eventId}
                      className="d-flex justify-content-between align-items-center p-4 rounded mt-1"
                      style={{
                        maxWidth: "500px",
                        width: "100%",
                        backgroundColor: "var(--color-green2)",
                        color: "var(--color-white)",
                      }}
                    >
                      <span className="fw-semibold">{attend.eventId}</span>

                      <span className="fw-semibold">
                        Joined at: {longToVisualDate(attend.joinedAt)}
                      </span>

                      <div className="d-flex gap-3">
                        <img
                          src={eventUpcoming}
                          alt="Remove friend"
                          onClick={() => navigate("/event/" + attend.eventId)}
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AccountAttends;
