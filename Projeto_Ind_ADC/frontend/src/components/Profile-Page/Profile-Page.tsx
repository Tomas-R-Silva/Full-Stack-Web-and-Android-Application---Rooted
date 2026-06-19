import ProfileCompleteModal from "./Profile-CompleteModal";
import { useState } from "react";
import ProfileIdPoints from "./Profile-Id-Points";
import ProfileInfo from "./Profile-Info";
import ProfileStats from "./Profile-stats";
import ProfileDashboard from "./Profile-Dashboard";

function ProfilePage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        className="d-flex justify-content-center pt-5"
        style={{ minHeight: "100vh", background: "var(--color-bege)" }}
      >
        <div
          className="container"
          style={{
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

            <div className="col-4 text-end">
              <h3>0 / 3 Completed</h3>
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
