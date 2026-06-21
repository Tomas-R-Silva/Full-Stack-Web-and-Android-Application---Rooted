import { useNavigate } from "react-router-dom";
import NavBar from "./components/NavBar/NavBar";

function App() {
  const navigate = useNavigate();

  return (
    <>
      <NavBar />
      <div>
        <button onClick={() => navigate("/login")}>Log In</button>
        <button onClick={() => navigate("/profile")}>Profile</button>
        <button onClick={() => navigate("/maps")}>Maps</button>
      </div>
    </>
  );
}

export default App;
