import type { EventProps } from "../../utils/types";
import { sdgInfos } from "../../utils/sdgInfo";
import { useState, useEffect } from "react";

function EventControlPanel({ event }: EventProps) {
  const [selectedSDGs, setSelectedSDGs] = useState<number[]>([]);

  const toggleSDG = (id: number) => {
    setSelectedSDGs((prev) =>
      prev.includes(id) ? prev.filter((sdgId) => sdgId !== id) : [...prev, id],
    );
  };

  const loadSdg = () => {
    if (event.sdg) event.sdg.map((i) => toggleSDG(i));
  };

  useEffect(() => {
    loadSdg();
  });

  return (
    <>
      <div className="container">
        <div className="row w-100 justify-content-center">
          <h1
            className="fw-bold mb-3"
            style={{
              color: "var(--color-green)",
            }}
          >
            Event Control Panel:
          </h1>
          <div className="input-group mb-3">
            <span
              className="input-group-text"
              style={{
                background: "var(--color-green2)",
                color: "var(--color-white)",
              }}
            >
              Title
            </span>
            <input
              type="text"
              className="form-control"
              placeholder={event.title}
            />
          </div>

          <div className="input-group mb-3">
            <span
              className="input-group-text"
              style={{
                background: "var(--color-green2)",
                color: "var(--color-white)",
              }}
            >
              Location
            </span>
            <input
              type="text"
              className="form-control"
              placeholder={event.location}
            />
          </div>

          <div className="input-group mb-3">
            <span
              className="input-group-text"
              style={{
                background: "var(--color-green2)",
                color: "var(--color-white)",
              }}
            >
              Date & Time
            </span>
            <input
              type="date"
              className="form-control"
              placeholder={String(event.startDate)}
            />
          </div>

          <div className="input-group mb-3">
            <span
              className="input-group-text"
              style={{
                background: "var(--color-green2)",
                color: "var(--color-white)",
              }}
            >
              Duration
            </span>
            <input
              type="number"
              className="form-control"
              placeholder={String(event.durationMinutes)}
            />
            <span
              className="input-group-text"
              style={{
                background: "var(--color-green2)",
                color: "var(--color-white)",
              }}
            >
              minutes
            </span>
          </div>

          <div className="input-group mb-3">
            <span
              className="input-group-text"
              style={{
                background: "var(--color-green2)",
                color: "var(--color-white)",
              }}
            >
              Minimum Vacancies:
            </span>
            <input
              type="text"
              className="form-control"
              placeholder={String(event.attendeeCount)}
            />
            <span
              className="input-group-text"
              style={{
                background: "var(--color-green2)",
                color: "var(--color-white)",
              }}
            >
              Maximum Vacancies
            </span>
            <input
              type="text"
              className="form-control"
              placeholder={String(event.maxAttendees)}
            />
            <span
              className="input-group-text"
              style={{
                background: "var(--color-green2)",
                color: "var(--color-white)",
              }}
            >
              persons
            </span>
          </div>

          <div className="d-flex gap-4 mb-3">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" />
              <label
                className="form-check-label"
                style={{
                  color: "var(--color-green)",
                }}
                defaultChecked={event.isPublic}
              >
                Public
              </label>
            </div>

            <div className="form-check">
              <input className="form-check-input" type="checkbox" />
              <label
                className="form-check-label"
                style={{
                  color: "var(--color-green)",
                }}
                defaultChecked={event.isAccessible}
              >
                Accessible
              </label>
            </div>
          </div>

          <div className="input-group">
            <span
              className="input-group-text"
              style={{
                background: "var(--color-green2)",
                color: "var(--color-white)",
              }}
            >
              Description
            </span>
            <textarea
              className="form-control"
              placeholder={event.description}
            ></textarea>
          </div>

          <div className="row g-3 mt-2">
            <h5
              style={{
                color: "var(--color-green)",
              }}
            >
              Sustainable Development Goals:
            </h5>
            {sdgInfos.map((sdg) => (
              <div key={sdg.id} className="col-6 col-md-3 col-lg-2">
                <div
                  className={"card h-100 text-center"}
                  style={{
                    cursor: "pointer",
                    transition: "0.2s",
                    backgroundColor: selectedSDGs.includes(sdg.id)
                      ? "var(--color-green2)"
                      : "white",
                  }}
                  onClick={() => toggleSDG(sdg.id)}
                >
                  <img
                    src={sdg.icon}
                    alt={sdg.title}
                    className="card-img-top p-2"
                    style={{
                      height: "70px",
                      width: "100%",
                      objectFit: "contain",
                    }}
                  />

                  <div className="card-body p-2">
                    <small
                      style={{
                        color: selectedSDGs.includes(sdg.id)
                          ? "var(--color-white)"
                          : "var(--color-green2)",
                      }}
                    >
                      {sdg.title}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default EventControlPanel;
