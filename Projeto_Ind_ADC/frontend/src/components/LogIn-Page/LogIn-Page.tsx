import LogInForm from "./LogIn-Form";
import signInImage from "../../assets/images/signIn-root.svg";

function LogInPage() {
  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <div
        className="d-none d-md-flex"
        style={{ background: "var(--color-green)", width: "33.33%" }}
      >
        <img src={signInImage} className="" alt="..." />
      </div>

      <div
        className="d-flex align-items-center justify-content-center flex-grow-1"
        style={{ background: "var(--color-bege)" }}
      >
        <LogInForm />
      </div>
    </div>
  );
}

export default LogInPage;
