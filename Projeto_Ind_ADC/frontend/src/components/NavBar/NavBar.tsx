import app from "../../assets/images/app_white.svg";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import account_circle from "../../assets/icons/account_circle_green2.svg";
import { getBorderItem } from "../../utils/borders";
import { useState, useEffect } from "react";
import type { UserInformationResponse } from "../../utils/types";
import { getUser } from "../../api/auth";
import verified_g from "../../assets/icons/verified_gold.svg";

function NavBar() {
  const { isAuthenticated, username, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInformationResponse>();
  const [sdgs, setSdgs] = useState<{ id: number; value: number }[]>([]);

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

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        background: "var(--color-green)",
        height: "85px",
        filter: "drop-shadow(0 0 8px black)",
        zIndex: 1050,
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

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          style={{ background: "var(--color-white)" }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}
          id="navbarContent"
          style={{
            background: isOpen ? "var(--color-green)" : "transparent",
            borderRadius: isOpen ? "12px" : undefined,
            marginTop: isOpen ? "8px" : undefined,
            padding: isOpen ? "1rem" : undefined,
          }}
        >
          <div className="navbar-nav me-auto p-3">
            <a className="nav-link text-white fw-bold" href="/events">
              Events
            </a>
            <a className="nav-link text-white fw-bold" href="/maps">
              Map
            </a>
            <a className="nav-link text-white fw-bold" href="/social">
              Social
            </a>
            <a className="nav-link text-white fw-bold" href="/faq">
              FAQ
            </a>
            <a className="nav-link text-white fw-bold" href="/aboutus">
              About Us
            </a>
          </div>

          <div className="ms-auto p-3">
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
                      src={user?.data.avatar.url ?? account_circle}
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
                      {user?.data.role === "PARTNER" && (
                        <img className="ms-1" src={verified_g} />
                      )}
                    </div>

                    <div className="d-flex align-items-center gap-1 ms-2 mt-1">
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
                </button>

                <ul
                  className="dropdown-menu shadow"
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
      </div>
    </nav>
  );
}

export default NavBar;
