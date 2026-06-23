import { useNavigate } from "react-router-dom";
import NavBar from "./components/NavBar/NavBar";
import SignInModal from "./components/SignIn-Page/SignIn-Modal";

function App() {
  const navigate = useNavigate();

  return (
    <>
      <NavBar />
      <a>⚠️ Under Construction ⚠️</a>
    </>
  );
}

export default App;
