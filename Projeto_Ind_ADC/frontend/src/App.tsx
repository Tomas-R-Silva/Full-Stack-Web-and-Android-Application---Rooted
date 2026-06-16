import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate("/signin")}>Sign In</button>
    </div>
  );
}

export default App;
