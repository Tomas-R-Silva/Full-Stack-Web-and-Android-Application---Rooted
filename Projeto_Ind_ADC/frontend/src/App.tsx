import { useNavigate } from "react-router-dom";
import NavBar from "./components/NavBar/NavBar";

function App() {
  const navigate = useNavigate();

  return (
    <>
      <NavBar />
    </>
  );
}

export default App;
