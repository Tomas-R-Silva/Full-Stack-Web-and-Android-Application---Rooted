import NavBar from "../NavBar/NavBar";
import { useMapsPage } from "../../api/maps";

const MapsPage = () => {
  const mapsApiKey = import.meta.env.VITE_API_KEY;
  const { mapRef, sortedEvents, activeEventId, focusEvent } = useMapsPage(mapsApiKey);

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

        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <h3 className="card-title">Nearby events</h3>
                {sortedEvents.length === 0 ? (
                  <div className="alert alert-info mt-3">There are no events loaded.</div>
                ) : (
                  <div className="overflow-auto pe-3" style={{ maxHeight: "65vh" }}>
                    {sortedEvents.map((event, idx) => {
                      const isLocated = event.position != null;
                      const isActive = event.eventId === activeEventId;
                      return (
                        <div
                          key={`${event.eventId}-${idx}`}
                          className={`mb-3 p-3 rounded bg-white border d-flex align-items-center justify-content-between ${
                            isActive ? "border-primary" : ""
                          }`}
                        >
                          <div>
                            <div className="fw-bold">{event.title}</div>
                            <div className="text-muted small my-1">{event.location}</div>
                            {event.distance != null && event.distance !== Infinity && event.distance >= 0 ? (
                              <div className="small text-dark">
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
                              opacity: isLocated ? 1 : 0.5,
                              cursor: isLocated ? "pointer" : "not-allowed",
                            }}
                            disabled={!isLocated}
                            onClick={() => focusEvent(event)}
                            aria-label={`Go to ${event.title} on the map`}
                            title={isLocated ? "Go to location" : "Location not available yet"}
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
                <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default MapsPage;
