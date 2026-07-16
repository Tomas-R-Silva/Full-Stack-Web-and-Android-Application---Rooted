import { useEffect, useState } from "react";
import NavBar from "../NavBar/NavBar";
import { getEventList } from "../../api/auth";
import type {
  EventItem,
  EventListResponse,
  FilterProps,
} from "../../utils/types";
import EventCard from "./Event-Card";
import EventModal from "./Event-Modal";
import { useAuth } from "../AuthContext";
import SDGslider from "../SDG-elements/SDG-Slider";
import EventsList from "./Events-List";
import accessible_w from "../../assets/icons/accessible_w.svg";
import { sdgInfos } from "../../utils/sdgInfo";

function EventsPage() {
  //================= Hooks ===================
  const [showModal, setShowModal] = useState(false);
  const { isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<FilterProps>({
    category: null,
    status: null,
    organizerUsername: null,
    isAccessible: null,
    sdg: [],
  });

  const authenticatedToModal = () => {
    if (isAuthenticated) {
      setShowModal(true);
    }
  };

  console.log(filter);

  return (
    <>
      <NavBar />

      <div
        className="container py-5"
        style={{ filter: showModal ? "blur(4px)" : "none" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 style={{ color: "var(--color-white" }}>Events</h1>

          {isAuthenticated && (
            <button
              className="btn fw-bold"
              style={{
                background: "var(--color-white)",
                color: "var(--color-green)",
              }}
              onClick={authenticatedToModal}
            >
              Create Event
            </button>
          )}
        </div>

        <SDGslider />

        <div
          className="rounded-4 p-3 my-4"
          style={{ background: "var(--color-green2)" }}
        >
          <div className="row g-3 align-items-end">
            <div className="col-lg-2 col-md-4">
              <label
                className="form-label fw-semibold"
                style={{ color: "var(--color-white)" }}
              >
                Search Bar
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
              />
            </div>

            <div className="col-lg-2 col-md-4">
              <label
                className="form-label fw-semibold"
                style={{ color: "var(--color-white)" }}
              >
                Organizer
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Search organizer..."
                value={filter.organizerUsername ?? ""}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    organizerUsername: e.target.value || null,
                  }))
                }
              />
            </div>

            <div className="col-lg-2 col-md-6">
              <label
                className="form-label fw-semibold"
                style={{ color: "var(--color-white)" }}
              >
                Theme
              </label>
              <select
                className="form-select"
                value={filter.category ?? ""}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    category: e.target.value || null,
                  }))
                }
              >
                <option value="">All Themes</option>
                <option value={"MUSIC"}>Music</option>
                <option value={"SPORTS"}>Sports</option>
                <option value={"TECH"}>Tech</option>
                <option value={"ART"}>Art</option>
                <option value={"FOOD"}>Food</option>
                <option value={"BUSINESS"}>Business</option>
                <option value={"COMMUNITY"}>Community</option>
                <option value={"OTHER"}>Other</option>
              </select>
            </div>

            <div className="col-lg-2 col-md-4">
              <label
                className="form-label fw-semibold"
                style={{ color: "var(--color-white)" }}
              >
                SDGs
              </label>

              <div className="dropdown w-100">
                <button
                  className="btn dropdown-toggle w-100 text-start"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ background: "var(--color-white)" }}
                >
                  {filter.sdg?.length
                    ? `${filter.sdg.length} selected`
                    : "Select SDGs"}
                </button>

                <ul
                  className="dropdown-menu w-100 p-2"
                  style={{ maxHeight: "300px", overflowY: "auto" }}
                >
                  {sdgInfos.map((sdg) => (
                    <li key={sdg.id}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`sdg-${sdg.id}`}
                          checked={filter.sdg?.includes(sdg.id) ?? false}
                          onChange={(e) => {
                            setFilter((prev) => {
                              const newArray = e.target.checked
                                ? [...(prev.sdg ?? []), sdg.id]
                                : (prev.sdg ?? []).filter(
                                    (id) => id !== sdg.id,
                                  );

                              return {
                                ...prev,
                                sdg: newArray.length > 0 ? newArray : null,
                              };
                            });
                          }}
                        />

                        <label
                          className="form-check-label"
                          htmlFor={`sdg-${sdg.id}`}
                        >
                          {sdg.id} - {sdg.title}
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-lg-2 col-md-6">
              <label
                className="form-label fw-semibold"
                style={{ color: "var(--color-white)" }}
              >
                Status
              </label>
              <select
                className="form-select"
                value={filter.status ?? ""}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    status: e.target.value || null,
                  }))
                }
              >
                <option value="">All</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Finished">Finished</option>
                <option value="Canceled">Canceled</option>
              </select>
            </div>

            <div className="col-lg-1 col-md-2">
              <label
                className="form-label fw-semibold"
                style={{ color: "var(--color-white)" }}
              >
                Accessibility
              </label>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="wheelchairAccessible"
                  checked={filter.isAccessible ?? false}
                  onChange={(e) =>
                    setFilter((prev) => ({
                      ...prev,
                      isAccessible: e.target.checked ? true : null,
                    }))
                  }
                />
                <label
                  className="form-check-label"
                  htmlFor="wheelchairAccessible"
                >
                  <img
                    src={accessible_w}
                    alt="Settings"
                    style={{
                      width: "24px",
                      height: "24px",
                      cursor: "pointer",
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="col-lg-1 col-md-6 d-grid">
              <button
                className="btn"
                style={{
                  color: "var(--color-green)",
                  background: "var(--color-white)",
                }}
                onClick={() =>
                  setFilter({
                    category: null,
                    status: null,
                    organizerUsername: null,
                    isAccessible: null,
                    sdg: null,
                  })
                }
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <EventsList filter={filter} />
      </div>
      {showModal && <EventModal onClose={() => setShowModal(false)} />}
    </>
  );
}

export default EventsPage;
