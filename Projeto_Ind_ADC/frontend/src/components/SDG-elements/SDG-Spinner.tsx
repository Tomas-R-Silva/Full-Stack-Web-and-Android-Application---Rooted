import "./SDG-Spinner.css";
import React from "react";
import { useNavigate } from "react-router-dom";
import { sdgItems } from "../../utils/sdgCircle";

const ROTATION_STEP = 360 / 17;

function SDGspinner() {
  const navigate = useNavigate();
  const wheelRef = React.useRef<HTMLDivElement | null>(null);
  const angleRef = React.useRef(0);
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    let frame: number;

    const animate = () => {
      angleRef.current = (angleRef.current - 0.3) % 360;

      if (wheelRef.current) {
        wheelRef.current.style.transform = `rotate(${angleRef.current}deg)`;
      }

      const normalized = (360 - angleRef.current) % 360;
      const index = Math.floor(normalized / ROTATION_STEP) % sdgItems.length;

      setActiveIndex(index);

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      ref={wheelRef}
      style={{
        position: "absolute",
        width: 300,
        height: 300,

        /* Push half of the wheel outside the wrapper */
        right: -350,

        /* Vertically center it */
        top: "20%",
        transformOrigin: "center",
      }}
    >
      {sdgItems.map((item, i) => (
        <img
          key={item.id}
          src={item.image}
          alt={item.title}
          title={item.title}
          onClick={() => navigate(item.href)}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `
            translate(-50%, -50%)
            rotate(${i * ROTATION_STEP}deg)
            
          `,
            transformOrigin: "center",
            cursor: "pointer",
            filter:
              i === activeIndex
                ? "brightness(1.2) drop-shadow(0 0 8px white)"
                : "brightness(0.9)",
            zIndex: i === activeIndex ? 1 : 0,
          }}
        />
      ))}
    </div>
  );
}

export default SDGspinner;
