function ProfileDashboard() {
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
      <div className="col">
        <div className="d-flex align-items-center gap-3">
          <h3 className="mb-0">Admin dashboard:</h3>

          <button
            className="btn"
            style={{
              background: "var(--color-green)",
              color: "var(--color-bege)",
            }}
            onClick={() => console.log("Dashboard")}
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileDashboard;
