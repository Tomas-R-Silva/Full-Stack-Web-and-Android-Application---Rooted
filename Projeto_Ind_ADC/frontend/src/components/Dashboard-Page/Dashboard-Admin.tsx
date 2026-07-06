import NavBar from "../NavBar/NavBar";
import { useState } from "react";
import Activity from "./Activity";
import Community from "./Community";
import SDGs from "./SDGs";
import ModerationUsers from "./Moderation-Users";
import ModerationPartners from "./Moderation-Partners";
import ModerationEvents from "./Moderation-Events";

function DashboardADM() {
  const dashboardItems = [
    "Activity",
    "Comunity",
    "SDGs",
    "Moderation (Users)",
    "Moderation (Events)",
    "Moderation (Partners)",
  ];
  const [selected, setSelected] = useState(dashboardItems[0]);

  const handleSelect = (selection: string) => {
    setSelected(selection);
  };

  return (
    <>
      <NavBar />
      <div className="container-fluid py-5 px-5">
        <div className="row g-3">
          <div className="col-md-2">
            <div
              className="rounded-4 h-100 p-3"
              style={{ background: "var(--color-white)" }}
            >
              <div className="flex-column py-3">
                <h3 style={{ color: "var(--color-green)" }}>Menu</h3>
                {dashboardItems.map((item, i) => (
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
                            ? "var(--color-gold)"
                            : "var(--color-green)",
                      }}
                      onClick={() => handleSelect(dashboardItems[i])}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-md-10">
            <div
              className="rounded-4 p-4 "
              style={{ background: "var(--color-white)", minHeight: "500px" }}
            >
              <h2 className="" style={{ color: "var(--color-green)" }}>
                Admin Dashboard: {selected}
              </h2>
              {selected === dashboardItems[0] && <Activity />}
              {selected === dashboardItems[1] && <Community />}
              {selected === dashboardItems[2] && <SDGs />}
              {selected === dashboardItems[3] && <ModerationUsers />}
              {selected === dashboardItems[4] && <ModerationEvents />}
              {selected === dashboardItems[5] && <ModerationPartners />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DashboardADM;
