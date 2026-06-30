import "./SDG-Slider.css";
import { useNavigate } from "react-router-dom";
import { sdgLinearItems } from "../../utils/sdgLinear";

function SDGslider() {
  const navigate = useNavigate();

  //======== Duplication ========
  const loopItems = [...sdgLinearItems, ...sdgLinearItems];

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

export default SDGslider;
