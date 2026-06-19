import { useState } from "react";

function ProfileInfo() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div
      className="row mt-4"
      style={{
        padding: "20px",
        border: "2px solid var(--color-green)",
        borderRadius: "16px",
        backgroundColor: "var(--color-white)",
      }}
    >
      <div className="d-flex align-items-center justify-content-between w-100">
        <h3 className="mb-0">Profile Information:</h3>

        <button
          className="btn"
          style={{
            background: "var(--color-green)",
            color: "var(--color-bege)",
          }}
          onClick={() => setShowInfo((prev) => !prev)}
        >
          {showInfo ? "Hide" : "Show"}
        </button>
      </div>
      <div
        className="mt-3"
        style={{
          filter: showInfo ? "none" : "blur(5px)",
          transition: "filter 0.2s",
        }}
      >
        <p>
          <span className="fw-bold">Name: </span>
          <span>Placeholder name</span>
        </p>
        <p>
          <span className="fw-bold">Email: </span>
          <span>Placeholder email</span>
        </p>
        <p>
          <span className="fw-bold">Password: </span>
          <span>Receive password via email</span>
        </p>
        <p>
          <span className="fw-bold">Role: </span>
          <span>Placeholder role</span>
        </p>
      </div>
    </div>
  );
}

export default ProfileInfo;
