import type { EventProps } from "../../utils/types";
import { sdgInfos } from "../../utils/sdgInfo";
import { useState, useEffect } from "react";

function EventControlPanel({ event }: EventProps) {
  const [selectedSDGs, setSelectedSDGs] = useState<number[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleImage = (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;

      setSelectedImages((prev) => [...prev, base64]);
    };

    reader.readAsDataURL(file);
  };

  const deleteImage = (image: string) => {
    setSelectedImages((prev) => prev.filter((img) => img !== image));
  };

  const selectCover = (image: string) => {
    setSelectedImages((prev) => {
      const filtered = prev.filter((img) => img !== image);
      return [image, ...filtered];
    });
  };

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
    if (event.imageUrls) {
      setSelectedImages(event.imageUrls);
    }
  }, [event.imageUrls]);

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
                    src={sdg.image}
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
          <div className="row g-3 mt-2">
            <h5
              style={{
                color: "var(--color-green)",
              }}
            >
              Event Images:
            </h5>
            <input
              type="file"
              accept="image/*"
              multiple
              className="form-control mb-3"
              style={{
                color: "var(--color-green)",
              }}
              onChange={(e) => {
                if (!e.target.files) return;

                Array.from(e.target.files).forEach(handleImage);
              }}
            />

            {selectedImages.map((image) => (
              <div key={image} className="col-6 col-md-3 col-lg-2">
                <div
                  className="card h-100 text-center"
                  style={{
                    cursor: "pointer",
                    transition: "0.2s",
                    backgroundColor:
                      selectedImages[0] === image
                        ? "var(--color-green2)"
                        : "white",
                  }}
                >
                  <img
                    src={image}
                    alt="event"
                    className="card-img-top p-2"
                    style={{
                      height: "70px",
                      width: "100%",
                      objectFit: "contain",
                    }}
                  />

                  <div
                    className="card-body p-2"
                    onClick={() => selectCover(image)}
                  >
                    <small style={{ color: "var(--color-gold)" }}>
                      {selectedImages[0] === image
                        ? "Cover image"
                        : "Select as cover"}
                    </small>
                  </div>

                  <div
                    className="card-body p-2"
                    onClick={() => deleteImage(image)}
                  >
                    <small style={{ color: "var(--color-ods1)" }}>Delete</small>
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
