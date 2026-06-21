function ProfileIdPoints() {
  return (
    <div
      className="row align-items-center mb-4"
      style={{
        padding: "20px",
        border: "2px solid var(--color-green)",
        borderRadius: "16px",
        backgroundColor: "var(--color-white)",
      }}
    >
      <div className="col-2">
        <div
          className="rounded-circle"
          style={{
            width: "150px",
            height: "150px",
            backgroundColor: "white",
            border: "4px solid var(--color-green)",
          }}
        />
      </div>

      <div className="col-8">
        <h2 style={{ color: "var(--color-green)" }}>Placeholder Name</h2>
        <p style={{ color: "var(--color-green)" }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget
          ligula eu lectus lobortis condimentum. Aliquam nonummy auctor massa.
          Pellentesque habitant morbi tristique senectus et netus et malesuada
          fames ac turpis egestas. Nulla at risus
        </p>
      </div>

      <div className="col-2 text-end">
        <h3>Points</h3>
      </div>
    </div>
  );
}

export default ProfileIdPoints;
