import { sdgLinearItems } from "../../utils/sdgLinear";
import NavBar from "../NavBar/NavBar";
import { useNavigate } from "react-router-dom";
import sdgs_circle from "../../assets/images/sdgs_circle.png";
import Footer from "../NavBar/Footer";

function SDGoverall() {
  const navigate = useNavigate();
  const items = [
    ...sdgLinearItems,
    {
      id: 0,
      title: "SDGs",
      image: sdgs_circle,
      href: "/sdg",
    },
  ];
  return (
    <>
      <NavBar />
      <div className="container py-5">
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {items.map((item) => (
            <div className="col" key={item.id}>
              <div
                className="card h-100"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(item.href)}
              >
                <img
                  src={item.image}
                  className="card-img-top"
                  style={{
                    borderRadius: "6px",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default SDGoverall;
