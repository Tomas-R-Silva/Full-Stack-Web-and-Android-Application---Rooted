import SDOspinner from "../SDO-elements/SDO-Spinner";

function Row1() {
  return (
    <div className="row">
      <div className="d-flex" style={{ minHeight: "100vh" }}>
        <div
          className="d-none d-md-flex"
          style={{
            width: "65%",
            background: "var(--color-green)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingLeft: "80px",
          }}
        >
          <div>
            <h1
              style={{
                color: "var(--color-white)",
                fontSize: "64px",
                fontWeight: 800,
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              Make The <br />
              <span style={{ color: "var(--color-gold)" }}>Difference</span>
            </h1>

            <p
              style={{
                color: "white",
                marginTop: "10px",
                fontSize: "16px",
                opacity: 0.9,
              }}
            >
              with ROOTED today
            </p>

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
              onClick={() => console.log("clicked")}
            >
              Show me →
            </button>
          </div>
        </div>

        <div
          className="d-flex align-items-center justify-content-center flex-grow-1"
          style={{ background: "var(--color-green)" }}
        >
          <div className="spinner-wrapper">
            <SDOspinner />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Row1;
