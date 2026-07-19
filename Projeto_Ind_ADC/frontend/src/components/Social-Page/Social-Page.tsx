import NavBar from "../NavBar/NavBar";
import { useState } from "react";
import FindPage from "./Find-Page";
import FriendsRoom from "./Friends-Room";

function SocialPage() {
  const tabs = ["Find People", "My Friends"];
  const [selected, setSelected] = useState<string>(tabs[0]);
  return (
    <>
      <NavBar />
      <div className="container py-5">
        <div className="row text-center align-items-center">
          <div className="col-6">
            <div
              className={selected === tabs[0] ? "border-bottom" : ""}
              style={{ cursor: "pointer" }}
              onClick={() => setSelected(tabs[0])}
            >
              <div className="text-white mb-1">{tabs[0]}</div>
            </div>
          </div>

          <div className="col-6">
            <div
              className={selected === tabs[1] ? "border-bottom" : ""}
              style={{ cursor: "pointer" }}
              onClick={() => setSelected(tabs[1])}
            >
              <div className="text-white mb-1">{tabs[1]}</div>
            </div>
          </div>
        </div>
        <div className="row align-items-center mt-3">
          {selected === tabs[0] && <FindPage />}
          {selected === tabs[1] && <FriendsRoom />}
        </div>
      </div>
    </>
  );
}

export default SocialPage;
