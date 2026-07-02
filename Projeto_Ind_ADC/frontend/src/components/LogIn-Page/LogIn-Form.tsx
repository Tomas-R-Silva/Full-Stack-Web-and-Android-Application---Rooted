import LogInStep1 from "./LogIn-Step1";

function LogInForm() {
  //========== Return ==========
  return (
    <div style={{ width: "100%" }}>
      <h1
        className="text-center fw-bold mb-4"
        style={{ color: "var(--color-green)", fontSize: 32 }}
      >
        Log In into Rooted
      </h1>
      <LogInStep1 />
    </div>
  );
}

export default LogInForm;
