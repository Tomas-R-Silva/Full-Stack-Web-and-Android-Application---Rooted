import NavBar from "../NavBar/NavBar";
import { sdgInfos } from "../../utils/sdgInfo";
import type { FilterProps, SdgItem } from "../../utils/types";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import EventsList from "../Events-Page/Events-List";
import { useState, useEffect } from "react";

function SDGelements() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
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
    sdg: id ? [Number(id)] : [],
  });

  if (!id) {
    return <div>Invalid SDG number!</div>;
  }

  const sdg: SdgItem = sdgInfos[Number(id) - 1];

  const handleSDGFilter = (sdgId: number) => {
    setFilter((prev) => ({
      ...prev,
      sdg: [...(prev.sdg ?? []), sdgId],
    }));
  };

  useEffect(() => {
    handleSDGFilter(sdg.id);
  }, [id]);

  return (
    <>
      <NavBar />
      <div
        className="row"
        style={{
          backgroundImage: `url(${sdg.photo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="d-flex flex-column" style={{ minHeight: "50vh" }}>
          <div className="d-flex justify-content-between w-100 p-4">
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

          <div className="d-flex flex-grow-1">
            <div
              className="d-none d-md-flex"
              style={{
                width: "65%",
                alignItems: "center",
                paddingLeft: "80px",
              }}
            >
              <div>
                <p
                  style={{
                    color: "white",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/sdg")}
                >
                  ← All Sustainable Development Goals
                </p>

                <p
                  className={"fw-bold"}
                  style={{ color: "white", fontSize: "16px" }}
                >
                  Objective{" "}
                  <img
                    src={sdg.icon}
                    alt={`SDG ${sdg.id} icon`}
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "8px",
                    }}
                  />
                </p>

                <h1
                  style={{
                    color: "white",
                    fontSize: "64px",
                    fontWeight: 800,
                    lineHeight: 1.1,
                  }}
                >
                  {sdg.title}
                </h1>

                <p style={{ color: "white", fontSize: "16px" }}>
                  {sdg.description}
                </p>
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-center flex-grow-1">
              <img src={sdg.circle} />
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <h1 style={{ color: "var(--color-white" }}>
          Related Events{" "}
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

      <div className="container py-5">
        <h1 style={{ color: "var(--color-white" }}>
          Top 50{" "}
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
        {persons.map((p) => (
          <div
            key={p.username}
            className="rounded-3 p-3 mb-2 border text-white"
            style={{ background: "var(--color-green2)" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <span>{p.username}</span>
              <span>{p.value} events</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default SDGelements;
