function ProfileStats() {
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
        <h3 className="mb-0">Account Stats:</h3>
      </div>

      <div
        className="mt-3 w-100"
        style={{
          position: "relative",
        }}
      >
        <p>
          <span className="fw-bold">Member Since </span>
          <span>Placeholder Creation Time</span>
        </p>
        <p>
          <span className="fw-bold">Number of activities done: </span>
          <span>26</span>
        </p>
        <p>
          <span className="fw-bold">Number of activities organized: </span>
          <span>4</span>
        </p>
      </div>
    </div>
  );
}

export default ProfileStats;
