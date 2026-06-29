import { useNavigate } from "react-router-dom";
import NavBar from "./components/NavBar/NavBar";
import SDOspinner from "./components/SDO-elements/SDO-Spinner";
import { sdoItems } from "./utils/sdo";

function App() {
  const navigate = useNavigate();

  return (
    <>
      <NavBar />
      <SDOspinner />
    </>
  );
}

export default App;
