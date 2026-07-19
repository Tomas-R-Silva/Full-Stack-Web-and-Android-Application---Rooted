import { useState } from "react";
import NavBar from "../NavBar/NavBar";
import arrowRight_w from "../../assets/icons/arrow_right_w.svg";
import arrowRight from "../../assets/icons/arrow_right.svg";
import AccountInformation from "./Account-Information";
import FriendsList from "./Friends-List";
import FriendsRequests from "./Friends-Requests";
import { useAuth } from "../AuthContext";
import AccountEvents from "./Account-Events";
import { useNavigate } from "react-router-dom";
import AccountAttends from "./Account-Attends";
import AccountRewards from "./Account-Rewards";
import PreferedThemes from "./Prefered-Themes";

function AccountSettings() {
  const profileItems = [
    "Account Information",
    "Friends List",
    "Friends Requests",
    "My Events",
    "My Attends",
    "Admin Dashboard",
    "Backofficer Dashboard",
    "Claimed Rewards",
    "Recent Points",
  ];
  const personalizationItems = ["Preferred Themes"];
  const [selected, setSelected] = useState(profileItems[0]);
  const { username, role } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (selection: string) => {
    setSelected(selection);
  };

  return (
    <>
      <NavBar />
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-4">
            <h5 className="fw-bold" style={{ color: "var(--color-green2)" }}>
              Profile
            </h5>

            {profileItems.map((item, i) => {
              if (i === 5 && role !== "ADMIN") return null;
              if (i === 6 && role !== "BACKOFFICER") return null;

              return (
                <div
                  key={item}
                  className="d-flex justify-content-between align-items-center py-3 border-bottom"
                  style={{ cursor: "pointer" }}
                >
                  <span
                    className="fw-semibold"
                    style={{
                      color:
                        selected === item
                          ? "var(--color-green2)"
                          : "var(--color-white)",
                    }}
                    onClick={() => handleSelect(item)}
                  >
                    {item}
                  </span>

                  <img
                    src={selected === item ? arrowRight : arrowRight_w}
                    alt="Arrow"
                    onClick={() => handleSelect(item)}
                  />
                </div>
              );
            })}

            <h5
              className="fw-bold mt-5"
              style={{ color: "var(--color-green2)" }}
            >
              Personalization
            </h5>

            {personalizationItems.map((item, i) => (
              <div
                key={item}
                className="d-flex justify-content-between align-items-center py-3 border-bottom"
                style={{ cursor: "pointer" }}
              >
                <span
                  className="fw-semibold"
                  style={{
                    color:
                      selected === item
                        ? "var(--color-green2)"
                        : "var(--color-white)",
                  }}
                  onClick={() => handleSelect(personalizationItems[i])}
                >
                  {item}
                </span>
                <img
                  src={selected === item ? arrowRight : arrowRight_w}
                  alt="Arrow"
                  onClick={() => handleSelect(personalizationItems[i])}
                />
              </div>
            ))}
            <div className="mb-5"></div>
          </div>
          <div className="col-lg-8">
            {selected === profileItems[0] && <AccountInformation />}
            {selected === profileItems[1] && <FriendsList />}
            {selected === profileItems[2] && <FriendsRequests />}
            {selected === profileItems[3] && username && <AccountEvents />}
            {selected === profileItems[4] && username && <AccountAttends />}
            {selected === profileItems[5] && (
              <div className="container">
                <div className="row w-100 justify-content-center">
                  <div className="col-12 col-lg-8">
                    <h1 className="fw-bold text-white mb-3">Admin Dashboard</h1>
                    <p className="text-white mb-4">
                      Click in the button to be redirect to the Admin Dashboard.
                    </p>
                    <button
                      className="btn fw-bold"
                      style={{
                        background: "var(--color-white)",
                        color: "var(--color-green)",
                      }}
                      onClick={() => navigate("/dashboard/admin")}
                    >
                      Dashboard
                    </button>
                  </div>
                </div>
              </div>
            )}
            {selected === profileItems[6] && (
              <div className="container">
                <div className="row w-100 justify-content-center">
                  <div className="col-12 col-lg-8">
                    <h1 className="fw-bold text-white mb-3">
                      Backofficer Dashboard
                    </h1>
                    <p className="text-white mb-4">
                      Click in the button to be redirect to the Backofficer
                      Dashboard.
                    </p>

                    <button
                      className="btn fw-bold"
                      style={{
                        background: "var(--color-white)",
                        color: "var(--color-green)",
                      }}
                      onClick={() => navigate("/dashboard/backofficer")}
                    >
                      Dashboard
                    </button>
                  </div>
                </div>
              </div>
            )}
            {selected === profileItems[7] && username && <AccountRewards />}
            {selected === personalizationItems[0] && username && (
              <PreferedThemes />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AccountSettings;
