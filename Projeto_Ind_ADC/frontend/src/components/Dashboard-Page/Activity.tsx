import { useState, useEffect } from "react";
import { getAuthSessions } from "../../api/auth";
import type { AuthSessionsResponse, TokenType } from "../../utils/types";
import personPin_w from "../../assets/icons/person_pin_w.svg";
import { useNavigate } from "react-router-dom";

function Activity() {
  const [authSessions, setAuthSession] = useState<TokenType[]>([]);
  const navigate = useNavigate();

  const loadAuthSessions = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }

      const res: AuthSessionsResponse = await getAuthSessions({
        token: { jwt: token },
      });

      console.log(res.data);
      setAuthSession(res.data.tokens);
    } catch (err) {
      console.error(err);
    }
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

  useEffect(() => {
    loadAuthSessions();
  }, []);

  return (
    <>
      <div className="container py-3">
        <div className="row">
          <div className="col">
            <h4>Auth Sessions:</h4>
            <div
              className="container border rounded p-3"
              style={{
                maxHeight: "500px",
                overflowY: "auto",
              }}
            >
              {authSessions.length === 0 && (
                <div
                  className="alert alert-light"
                  style={{ color: "var(--color-green)" }}
                  role="alert"
                >
                  No auth sessions.
                </div>
              )}
              {authSessions.length !== 0 &&
                authSessions.map((session) => (
                  <div
                    className="d-flex justify-content-between align-items-start p-4 rounded mt-2"
                    style={{
                      maxWidth: "500px",
                      width: "100%",
                      backgroundColor: "var(--color-green2)",
                      color: "var(--color-white)",
                    }}
                  >
                    <div>
                      <span
                        className="fw-semibold"
                        style={{ color: "var(--color-grenn)" }}
                      >
                        Username:{" "}
                      </span>
                      <span>{session.username}</span>

                      <div>
                        <span
                          className="fw-semibold"
                          style={{ color: "var(--color-grenn)" }}
                        >
                          TokenId:{" "}
                        </span>
                        <span>{session.tokenID}</span>
                      </div>

                      <div>
                        <span
                          className="fw-semibold"
                          style={{ color: "var(--color-grenn)" }}
                        >
                          Expires at:{" "}
                        </span>
                        <span>{formatDate(session.expiresAt)}</span>
                      </div>
                    </div>

                    <img
                      src={personPin_w}
                      alt="View Profile"
                      onClick={() => navigate("/profile/" + session.username)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                ))}
            </div>
          </div>

          <div className="col"></div>
        </div>
      </div>
    </>
  );
}

export default Activity;
