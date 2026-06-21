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
        className="mt-3 w-100"
        style={{
          position: "relative",
        }}
      >
        <div
          style={{
            filter: showInfo ? "none" : "blur(5px)",
            transition: "filter 0.2s",
            userSelect: showInfo ? "auto" : "none",
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

        {!showInfo && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                color: "var(--color-green)",
                padding: "10px 18px",
                borderRadius: "12px",
                fontWeight: "bold",
                border: "1px solid var(--color-green)",
              }}
            >
              Sensitive information blurred
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileInfo;
