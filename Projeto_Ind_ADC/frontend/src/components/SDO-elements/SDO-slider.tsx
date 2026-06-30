import "./SDO-Slider.css";
import { useNavigate } from "react-router-dom";
import { sdoLinearItems } from "../../utils/sdoLinear";

function SDOslider() {
  const navigate = useNavigate();

  //======== Duplication ========
  const loopItems = [...sdoLinearItems, ...sdoLinearItems];

  return (
    <div className="slider">
      <div className="track">
        {loopItems.map((item, i) => (
          <img
            key={`${item.id}-${i}`}
            src={item.image}
            alt={item.title}
            title={item.title}
            onClick={() => navigate(item.href)}
            style={{ cursor: "pointer" }}
          />
        ))}
      </div>
    </div>
  );
}

export default SDOslider;
