import NavBar from "../NavBar/NavBar";
import { sdgInfos } from "../../utils/sdgInfo";
import {
  type Top,
  type FilterProps,
  type SdgItem,
  type TopSDGResponse,
} from "../../utils/types";
import { useParams, useNavigate } from "react-router-dom";
import EventsList from "../Events-Page/Events-List";
import { useState, useEffect } from "react";
import Footer from "../NavBar/Footer";
import { getTopSDG } from "../../api/auth";

function SDGelements() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [tops, setTops] = useState<Top[]>([]);
  const sdgId = Number(id);
  const isValidSdgId = Number.isInteger(sdgId) && sdgId >= 1 && sdgId <= 17;

  const persons = [
    { username: "Alexandre", value: "100" },
    { username: "Tomás", value: "80" },
    { username: "Artur", value: "60" },
    { username: "Gustavo", value: "40" },
    { username: "Eduardo", value: "20" },
    { username: "Gonçalo", value: "1" },
  ];

  const [filter, setFilter] = useState<FilterProps>({
    category: null,
    status: null,
    organizerUsername: null,
    isAccessible: false,
    sdg: isValidSdgId ? [sdgId] : [],
  });

  const loadTop = async () => {
    try {
      const res: TopSDGResponse = await getTopSDG({});
      console.log(res.data);
      setTops(res.data.topBySDG);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTop();
  }, []);

  useEffect(() => {
    if (!isValidSdgId) return;

    setFilter((prev) => ({
      ...prev,
      sdg: [sdgId],
    }));
  }, [sdgId, isValidSdgId]);

  if (!isValidSdgId) {
    return (
      <>
        <NavBar />
        <div className="container py-5">
          <h1 className="text-white">Invalid SDG number!</h1>
          <button
            className="btn btn-outline-light mt-3"
            onClick={() => navigate("/sdg")}
          >
            Back to SDGs
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const sdg: SdgItem = sdgInfos[sdgId - 1];

  return (
    <>
      <NavBar />

      <div
        className="container-fluid px-0"
        style={{
          backgroundImage: `url(${sdg.photo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="d-flex flex-column"
          style={{
            minHeight: "50vh",
          }}
        >
          <div className="d-flex justify-content-between align-items-center w-100 p-3 p-md-4 gap-2">
            <button
              className="btn btn-outline-light"
              onClick={() => navigate("/sdg/" + (sdg.id - 1))}
              disabled={sdg.id === 1}
            >
              Previous
            </button>

            <button
              className="btn btn-outline-light"
              onClick={() => navigate("/sdg/" + (sdg.id + 1))}
              disabled={sdg.id === 17}
            >
              Next
            </button>
          </div>

          <div className="container flex-grow-1 d-flex align-items-center py-4 py-md-5">
            <div className="row align-items-center w-100 g-4">
              <div className="col-12 col-lg-7 text-center text-lg-start">
                <p
                  className="mb-3"
                  style={{
                    color: "white",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/sdg")}
                >
                  ← All Sustainable Development Goals
                </p>

                <p
                  className="fw-bold d-flex align-items-center justify-content-center justify-content-lg-start gap-2"
                  style={{ color: "white", fontSize: "16px" }}
                >
                  Objective
                  <img
                    src={sdg.icon}
                    alt={`SDG ${sdg.id} icon`}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "8px",
                    }}
                  />
                </p>

                <h1
                  style={{
                    color: "white",
                    fontSize: "clamp(36px, 8vw, 64px)",
                    fontWeight: 800,
                    lineHeight: 1.1,
                  }}
                >
                  {sdg.title}
                </h1>

                <p
                  className="mx-auto mx-lg-0"
                  style={{
                    color: "white",
                    fontSize: "clamp(15px, 2vw, 18px)",
                    maxWidth: "700px",
                  }}
                >
                  {sdg.description}
                </p>
              </div>

              <div className="col-12 col-lg-5 d-flex align-items-center justify-content-center">
                <img
                  src={sdg.circle}
                  alt={`SDG ${sdg.id}`}
                  className="img-fluid"
                  style={{
                    maxWidth: "min(320px, 80vw)",
                    height: "auto",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4 py-md-5">
        <h1
          className="d-flex flex-wrap align-items-center gap-2 mb-4"
          style={{
            color: "var(--color-white)",
            fontSize: "clamp(28px, 5vw, 40px)",
          }}
        >
          Related Events
          <img
            src={sdg.icon}
            alt={`SDG ${sdg.id} icon`}
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "16px",
            }}
          />
          :
        </h1>

        <EventsList filter={filter} />
      </div>

      <div className="container py-4 py-md-5">
        <h1
          className="d-flex flex-wrap align-items-center gap-2 mb-4"
          style={{
            color: "var(--color-white)",
            fontSize: "clamp(28px, 5vw, 40px)",
          }}
        >
          Top 50
          <img
            src={sdg.icon}
            alt={`SDG ${sdg.id} icon`}
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "16px",
            }}
          />
          :
        </h1>

        <div className="row g-3">
          {persons.map((p, index) => (
            <div key={p.username} className="col-12">
              <div
                className="rounded-3 p-3 border text-white"
                style={{ background: "var(--color-green2)" }}
              >
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
                  <span className="fw-semibold">
                    #{index + 1} {p.username}
                  </span>

                  <span>{p.value} events</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default SDGelements;
