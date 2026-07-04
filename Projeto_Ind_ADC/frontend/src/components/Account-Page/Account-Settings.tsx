import { useState } from "react";
import NavBar from "../NavBar/NavBar";
import arrowRight_w from "../../assets/icons/arrow_right_w.svg";
import arrowRight from "../../assets/icons/arrow_right.svg";
import AccountInformation from "./Account-Information";
import FriendsList from "./Friends-List";

function AccountSettings() {
  const profileItems = [
    "Account Information",
    "Friends List",
    "Friends Requests",
    "My Events",
    "Admin/Back Office Dashboard",
    "Claimed Rewards",
    "Recent Points",
  ];
  const personalizationItems = ["Preferred SDG", "Preferred Themes"];
  const [selected, setSelected] = useState(profileItems[0]);

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

            {profileItems.map((item, i) => (
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
                  onClick={() => handleSelect(profileItems[i])}
                >
                  {item}
                </span>
                <img
                  src={selected === item ? arrowRight : arrowRight_w}
                  alt="Arrow"
                  onClick={() => handleSelect(profileItems[i])}
                />
              </div>
            ))}

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
          </div>
          <div className="col-lg-8">
            {selected === profileItems[0] && <AccountInformation />}
            {selected === profileItems[1] && <FriendsList />}
          </div>
        </div>
      </div>
    </>
  );
}

export default AccountSettings;
