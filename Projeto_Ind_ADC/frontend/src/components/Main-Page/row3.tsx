import phone from "../../assets/images/Phone.png";

function Row3() {
  return (
    <div
      className="row"
      style={{
        backgroundImage: `url(${phone})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "3rem",
      }}
    >
      <h1
        style={{
          color: "var(--color-white)",
          fontSize: "64px",
          fontWeight: 800,
          lineHeight: 1.1,
          margin: 0,
        }}
      >
        Install <br />
        <span style={{ color: "var(--color-gold)" }}>Rooted</span>
      </h1>

      <p
        style={{
          color: "white",
          marginTop: "10px",
          fontSize: "16px",
          opacity: 0.9,
        }}
      >
        in your phone & start enjoying it
      </p>
      <div className="d-flex justify-content-center justify-content-md-start">
        <button
          style={{
            marginTop: "20px",
            padding: "10px 18px",
            borderRadius: "8px",
            border: "none",
            background: "white",
            color: "var(--color-green)",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          onClick={() => console.log("Downloading...")}
        >
          Download App
        </button>
      </div>
    </div>
  );
}

export default Row3;
