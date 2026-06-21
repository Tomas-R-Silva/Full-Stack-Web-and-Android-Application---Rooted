import ProfileCompleteModal from "./Profile-CompleteModal";
import { useState } from "react";
import ProfileIdPoints from "./Profile-Id-Points";
import ProfileInfo from "./Profile-Info";
import ProfileStats from "./Profile-stats";
import ProfileDashboard from "./Profile-Dashboard";
import profileBG from "../../assets/images/profile_bg.png";

function ProfilePage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `url(${profileBG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: showModal ? "blur(8px)" : "none",
          transition: "filter 0.2s",
          zIndex: -1,
        }}
      />

      <div
        className="d-flex justify-content-center pt-5"
        style={{ minHeight: "100vh", background: "transparent" }}
      >
        <div
          className="container"
          style={{
            maxWidth: "1000px",
            width: "100%",
            margin: "0 auto",
            filter: showModal ? "blur(4px)" : "none",
            transition: "filter 0.2s",
            pointerEvents: showModal ? "none" : "auto",
          }}
        >
          <ProfileIdPoints />

          <div
            className="row mt-4"
            style={{
              padding: "20px",
              border: "2px solid var(--color-green)",
              borderRadius: "16px",
              backgroundColor: "var(--color-white)",
            }}
          >
            <div className="col">
              <div className="d-flex align-items-center gap-3">
                <h3 className="mb-0">You need to complete your profile:</h3>

                <button
                  className="btn"
                  style={{
                    background: "var(--color-green)",
                    color: "var(--color-bege)",
                  }}
                  onClick={() => setShowModal(true)}
                >
                  Lets finish your profile
                </button>
              </div>
            </div>
          </div>
          <ProfileDashboard />
          <ProfileInfo />
          <ProfileStats />
        </div>
      </div>

      {showModal && (
        <ProfileCompleteModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

export default ProfilePage;
