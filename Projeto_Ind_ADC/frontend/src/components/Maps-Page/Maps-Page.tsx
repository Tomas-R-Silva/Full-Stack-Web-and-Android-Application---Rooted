import { useEffect, useState } from "react";
import NavBar from "../NavBar/NavBar";
import { useMapsPage } from "../../api/maps";
import placeholder from "../../assets/images/placeholder.png";
import type { FilterProps } from "../../utils/types";
import accessible_w from "../../assets/icons/accessible_w.svg";
import { sdgInfos } from "../../utils/sdgInfo";

const MapsPage = () => {
  const mapsApiKey = import.meta.env.VITE_API_KEY;
  const {
    setMapContainer,
    getFilteredEvents,
    getActiveEventId,
    getHasGeolocation,
    focusEvent,
    renderVisibleMarkers,
    hasValidCoords,
  } = useMapsPage(mapsApiKey);
  const activeEventId = getActiveEventId();
  const hasGeolocation = getHasGeolocation();

  const [filter, setFilter] = useState<FilterProps>({
    category: null,
    status: null,
    organizerUsername: null,
    isAccessible: null,
    sdg: [],
  });
  const [nearYouEnabled, setNearYouEnabled] = useState(false);
  const [nearYouRadiusKm, setNearYouRadiusKm] = useState(10);

  const filteredEvents = getFilteredEvents(nearYouEnabled, nearYouRadiusKm);

  useEffect(() => {
    renderVisibleMarkers(filteredEvents);
  }, [filteredEvents, renderVisibleMarkers]);

  return (
    <>
      <NavBar />

      <main className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="mb-0" style={{ color: "var(--color-white)" }}>
              Events Map
            </h1>
            <p className="mb-0" style={{ color: "var(--color-white)" }}>
              Explore the nearby events and see their location on the map.
            </p>
          </div>
        </div>

        <div
          className="rounded-4 p-3 my-4"
          style={{ background: "var(--color-green2)" }}
        >
          <div className="row g-3 align-items-end">
            <div className="col-lg-3 col-md-6">
              <label
                className="form-label fw-semibold"
                style={{ color: "var(--color-white)" }}
              >
                Filters:
              </label>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn"
                  style={{
                    color: "var(--color-green)",
                    background: nearYouEnabled
                      ? "rgba(255,255,255,0.5)"
                      : "var(--color-white)",
                    border: nearYouEnabled
                      ? "1px solid transparent"
                      : "1px solid var(--color-white)",
                  }}
                  onClick={() => setNearYouEnabled((prev) => !prev)}
                  disabled={!hasGeolocation}
                >
                  Near you
                </button>
                {nearYouEnabled && hasGeolocation && (
                  <>
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{
                        background: "var(--color-white)",
                        color: "var(--color-green)",
                      }}
                      onClick={() =>
                        setNearYouRadiusKm((prev) => Math.max(0, prev - 5))
                      }
                    >
                      -
                    </button>
                    <span
                      className="fw-bold"
                      style={{ color: "var(--color-white)" }}
                    >
                      {nearYouRadiusKm} km
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{
                        background: "var(--color-white)",
                        color: "var(--color-green)",
                      }}
                      onClick={() => setNearYouRadiusKm((prev) => prev + 5)}
                    >
                      +
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <h3 className="card-title">Nearby events</h3>
                {filteredEvents.length === 0 ? (
                  <div className="alert alert-info mt-3">
                    There are no events matching the current filters.
                  </div>
                ) : (
                  <div
                    className="overflow-auto pe-3"
                    style={{ maxHeight: "65vh" }}
                  >
                    {filteredEvents.map((event, idx) => {
                      const isLocated = hasValidCoords(event);
                      const isActive = event.eventId === activeEventId;
                      return (
                        <div
                          key={`${event.eventId}-${idx}`}
                          className={`mb-3 rounded border overflow-hidden position-relative ${
                            isActive ? "border-primary" : ""
                          }`}
                          style={{
                            minHeight: "120px",
                            backgroundImage: `url(${event.coverImageUrl || event.imageUrls?.[0]?.url || placeholder})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                          }}
                        >
                          <div
                            className="position-absolute top-0 start-0 w-100 h-100"
                            style={{
                              background:
                                "linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.1) 100%)",
                            }}
                          />
                          <div className="position-relative p-3 d-flex align-items-center justify-content-between h-100">
                            <div style={{ color: "var(--color-white)" }}>
                              <div className="fw-bold">{event.title}</div>
                              <div className="small my-1">{event.location}</div>
                              {event.distance != null &&
                              event.distance !== Infinity &&
                              event.distance >= 0 ? (
                                <div className="small">
                                  {(event.distance / 1000).toFixed(1)} km away
                                </div>
                              ) : (
                                <div></div>
                              )}
                            </div>

                            <button
                              type="button"
                              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ms-3 border-0"
                              style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: "var(--color-green)",
                                color: "var(--color-white)",
                                boxShadow: "0 0 0 2px var(--color-white)",
                                opacity: isLocated ? 1 : 0.5,
                                cursor: isLocated ? "pointer" : "not-allowed",
                              }}
                              disabled={!isLocated}
                              onClick={() => focusEvent(event)}
                              aria-label={`Go to ${event.title} on the map`}
                              title={
                                isLocated
                                  ? "Go to location"
                                  : "Location not available yet"
                              }
                            >
                              <svg
                                width="18"
                                height="18"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                viewBox="0 0 24 24"
                              >
                                <path d="M5 12h14" />
                                <path d="m13 5 7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-8">
            <div className="card shadow-sm h-100">
              <div className="card-body p-0" style={{ minHeight: "70vh" }}>
                <div
                  ref={setMapContainer}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default MapsPage;
