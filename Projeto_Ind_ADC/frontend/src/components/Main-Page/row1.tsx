import SDGspinner from "../SDG-elements/SDG-Spinner";
import { useNavigate } from "react-router-dom";

function Row1() {
  const navigate = useNavigate();

  return (
    <div
      className="container-fluid px-0"
      style={{ overflowX: "hidden", overflowY: "hidden" }}
    >
      <div
        className="row g-0 align-items-center"
        style={{
          minHeight: "100vh",
          background: "var(--color-green)",
        }}
      >
        <div className="col-12 col-md-7">
          <div
            className="d-flex align-items-center justify-content-center justify-content-md-start text-center text-md-start"
            style={{
              minHeight: "100vh",
              padding: "60px 24px",
            }}
          >
            <div
              style={{
                maxWidth: "600px",
              }}
              className="ps-md-5"
            >
              <h1
                style={{
                  color: "var(--color-white)",
                  fontSize: "clamp(42px, 8vw, 64px)",
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
                  fontSize: "clamp(15px, 2vw, 18px)",
                  opacity: 0.9,
                }}
              >
                with ROOTED today
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
                  onClick={() => navigate("/sdg")}
                >
                  Show me →
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-5 d-none d-md-flex">
          <div
            className="d-flex align-items-center justify-content-center w-100"
            style={{
              minHeight: "100vh",
              padding: "30px 24px",
            }}
          >
            <div
              className="spinner-wrapper"
              style={{
                width: "100%",
                maxWidth: "520px",
              }}
            >
              <SDGspinner />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Row1;
