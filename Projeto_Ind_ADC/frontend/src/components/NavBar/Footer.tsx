import { useNavigate } from "react-router-dom";
import ods from "../../assets/images/sdgs_circle.png";

function Footer() {
  const navigate = useNavigate();
  return (
    <>
      <footer
        className="mt-5 py-5"
        style={{
          backgroundColor: "var(--color-green)",
          filter: "drop-shadow(0 0 8px black)",
          color: "white",
        }}
      >
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-4">
              <h3 className="fw-bold">ROOTED</h3>
              <p className="text-white">
                Connecting communities through sustainable activities inspired
                by the United Nations Sustainable Development Goals.
              </p>
            </div>

            <div className="col-md-2 mb-4">
              <h5>Navigation</h5>
              <ul className="list-unstyled">
                <li>
                  <a href="/" className="text-white text-decoration-none">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/events" className="text-white text-decoration-none">
                    Events
                  </a>
                </li>
                <li>
                  <a
                    href="/aboutus"
                    className="text-white text-decoration-none"
                  >
                    About Us
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-md-3 mb-4">
              <h5>Contact</h5>
              <p className="mb-1">📧 rooted@gmail.com</p>
              <p className="mb-1">📍 Monte da Caparica, Portugal</p>
            </div>

            <div className="col-md-3 mb-4">
              <div
                className="card h-100 mx-auto"
                style={{
                  cursor: "pointer",
                  maxWidth: "100px",
                  maxHeight: "100px",
                }}
                onClick={() => navigate("/sdg")}
              >
                <img
                  src={ods}
                  className="card-img-top"
                  style={{
                    borderRadius: "6px",
                    maxHeight: "250px",
                    objectFit: "contain",
                  }}
                  alt="SDG"
                />
              </div>
            </div>
          </div>

          <hr className="border-light" />

          <div className="text-center text-white-50">
            © {new Date().getFullYear()} ROOTED • Developed by{" "}
            <strong>2Gather</strong>. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
