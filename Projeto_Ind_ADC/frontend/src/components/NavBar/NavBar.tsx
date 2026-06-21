import app from "../../assets/images/app_white.svg";

function NavBar() {
  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{ background: "var(--color-green)", height: "85px" }}
    >
      <div className="container-fluid h-100 d-flex align-items-center">
        {/* Logo */}
        <a className="navbar-brand d-flex align-items-center me-4" href="/">
          <img
            src={app}
            alt="Logo"
            width="40"
            height="40"
            style={{
              borderRadius: "8px",
              objectFit: "cover",
            }}
          />
        </a>

        <div className="d-none d-lg-flex align-items-center gap-4">
          <a
            className="navbar-brand fw-bold m-0"
            style={{ color: "var(--color-bege)" }}
            href="/maps"
          >
            Maps
          </a>

          <a
            className="navbar-brand fw-bold m-0"
            style={{ color: "var(--color-bege)" }}
            href="/faq"
          >
            FAQ
          </a>

          <a
            className="navbar-brand fw-bold m-0"
            style={{ color: "var(--color-bege)" }}
            href="/aboutus"
          >
            About Us
          </a>
        </div>

        <a
          className="btn fw-bold ms-auto"
          style={{
            border: "none",
            background: "var(--color-white)",
            color: "var(--color-green)",
            width: "130px",
            height: "42px",
            borderRadius: "50px",
          }}
          href="/login"
        >
          Login
        </a>
      </div>
    </nav>
  );
}

export default NavBar;
