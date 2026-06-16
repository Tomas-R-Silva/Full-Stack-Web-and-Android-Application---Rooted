import SignInForms from "./components/SignIn-Page/SignIn-Form";
import signInImage from "./assets/images/signIn-root.svg";

function App() {
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
        <SignInForms />
      </div>
    </div>
  );
}

export default App;
