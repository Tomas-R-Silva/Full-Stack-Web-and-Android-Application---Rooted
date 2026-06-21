import { useNavigate } from "react-router-dom";
import NavBar from "./components/NavBar/NavBar";

function App() {
  const navigate = useNavigate();

  return (
    <>
      <NavBar />
      <div>
        <button onClick={() => navigate("/profile")}>Profile</button>
      </div>
    </>
  );
}

export default App;
