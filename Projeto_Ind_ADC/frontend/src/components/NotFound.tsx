import Footer from "./NavBar/Footer";
import NavBar from "./NavBar/NavBar";
import image404 from "../assets/images/404.png";

function NotFound() {
  return (
    <>
      <NavBar />

      <main className="d-flex justify-content-center align-items-center mt-5">
        <img src={image404} alt="404 - Page Not Found" className="img-fluid" />
      </main>

      <Footer />
    </>
  );
}

export default NotFound;
