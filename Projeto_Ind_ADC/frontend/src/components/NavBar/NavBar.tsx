import app from "../../assets/images/app_white.svg";
import { useAuth } from "../AuthContext";

function NavBar() {
  const { isAuthenticated, username, logout } = useAuth();

  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{ background: "var(--color-green)", height: "85px" }}
    >
      <div className="container-fluid h-100 d-flex align-items-center">
        <a className="navbar-brand d-flex align-items-center me-4" href="/">
          <img
            src={app}
            alt="Logo"
            width="40"
            height="40"
            style={{
              borderRadius: "8px",
              objectFit: "cover",
            }}
          />
        </a>

        <div className="d-none d-lg-flex align-items-center gap-4">
          <a
            className="navbar-brand fw-bold m-0"
            style={{ color: "var(--color-bege)" }}
            href="/profile"
          >
            Profile
          </a>

          <a
            className="navbar-brand fw-bold m-0"
            style={{ color: "var(--color-bege)" }}
            href="/events"
          >
            Events
          </a>

          <a
            className="navbar-brand fw-bold m-0"
            style={{ color: "var(--color-bege)" }}
            href="/maps"
          >
            Maps
          </a>

          <a
            className="navbar-brand fw-bold m-0"
            style={{ color: "var(--color-bege)" }}
            href="/faq"
          >
            FAQ
          </a>

          <a
            className="navbar-brand fw-bold m-0"
            style={{ color: "var(--color-bege)" }}
            href="/aboutus"
          >
            About Us
          </a>
        </div>

        <div className="ms-auto">
          {isAuthenticated ? (
            <div className="d-flex align-items-center gap-2">
              <a
                style={{
                  color: "var(--color-bege)",
                  fontWeight: 600,
                  fontSize: 18,
                }}
              >
                Account:{" "}
              </a>
              <span
                style={{
                  color: "var(--color-bege)",
                  fontSize: 12,
                }}
              >
                {username}
              </span>

              <button
                onClick={logout}
                className="btn fw-bold"
                style={{
                  border: "none",
                  background: "var(--color-white)",
                  color: "var(--color-green)",
                  width: "130px",
                  height: "42px",
                  borderRadius: "50px",
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <a
              className="btn fw-bold"
              style={{
                border: "none",
                background: "var(--color-white)",
                color: "var(--color-green)",
                width: "130px",
                height: "42px",
                borderRadius: "50px",
              }}
              href="/login"
            >
              Login
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
