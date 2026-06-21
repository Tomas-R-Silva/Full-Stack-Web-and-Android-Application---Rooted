import app from "../../assets/images/app_dark_green.png";
import "./NavBar.css";

function NavBar() {
  return (
    <nav className="navbar navbar-expand bg-green custom-navbar">
      <div className="container-fluid px-5 position-relative h-100">
        <a className="navbar-brand custom-logo" href="#">
          <img src={app} alt="Rooted logo" />
        </a>

        <div className="navbar-nav ms-auto align-items-center gap-5">
          <a className="nav-link navbar-link" href="#faq">
            FAQ
          </a>

          <a className="nav-link navbar-link" href="#about">
            About us
          </a>

          <a className="btn login-button" href="login">
            Login
          </a>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
