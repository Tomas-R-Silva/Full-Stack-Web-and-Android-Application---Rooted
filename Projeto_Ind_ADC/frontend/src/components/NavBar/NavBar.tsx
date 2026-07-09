import app from "../../assets/images/app_white.svg";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import account_circle from "../../assets/icons/account_circle_green2.svg";
import all_border from "../../assets/images/all_ods_border.png";

function NavBar() {
  const { isAuthenticated, username, logout } = useAuth();
  const navigate = useNavigate();
  const sdgs = [6, 10, 13];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        background: "var(--color-green)",
        height: "85px",
        filter: "drop-shadow(0 0 8px black)",
      }}
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
            href="/events"
          >
            Events
          </a>

          <a
            className="navbar-brand fw-bold m-0"
            style={{ color: "var(--color-bege)" }}
            href="/maps"
          >
            Map
          </a>

          <a
            className="navbar-brand fw-bold m-0"
            style={{ color: "var(--color-bege)" }}
            href="/faq"
          >
            FAQ
          </a>
        </div>

        <div className="ms-auto">
          {isAuthenticated ? (
            <div className="dropdown">
              <button
                className="btn d-flex align-items-center gap-2 px-3 py-2"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{
                  background: "var(--color-white)",
                  borderRadius: "50px",
                  border: "none",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "48px",
                    height: "48px",
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
                    src={all_border}
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

                <div className="text-start">
                  <div
                    className="fw-bold"
                    style={{
                      color: "var(--color-green)",
                      fontSize: "14px",
                      lineHeight: "16px",
                    }}
                  >
                    {username}
                  </div>

                  <div className="d-flex align-items-center gap-1 ms-2 mt-1">
                    {sdgs.map((id) => (
                      <div
                        key={id}
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: `var(--color-ods${id})`,

                          flexShrink: 0,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </button>

              <ul
                className="dropdown-menu dropdown-menu-end shadow"
                style={{
                  borderRadius: "12px",
                }}
              >
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/profile/" + username)}
                  >
                    Profile
                  </button>
                </li>

                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/account/settings")}
                  >
                    Account Settings
                  </button>
                </li>

                <li>
                  <button
                    className="dropdown-item fw-bold"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </ul>
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
