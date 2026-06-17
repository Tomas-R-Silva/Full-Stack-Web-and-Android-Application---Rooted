import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate("/signin")}>Sign In</button>
      <button onClick={() => navigate("/login")}>Log In</button>
      <button onClick={() => navigate("/profile")}>Profile</button>
    </div>
  );
}

export default App;
