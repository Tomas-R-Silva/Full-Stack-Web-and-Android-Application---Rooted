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

function EventsPage() {
  //================= Hooks ===================
  const [showModal, setShowModal] = useState(false);
  const { isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<FilterProps>({
    filter: "",
  });

  const authenticatedToModal = () => {
    if (isAuthenticated) {
      setShowModal(true);
    }
  };

  return (
    <>
      <NavBar />

      <div
        className="container py-5"
        style={{ filter: showModal ? "blur(4px)" : "none" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 style={{ color: "var(--color-white" }}>Events</h1>

          <button
            className="btn"
            style={{
              background: "var(--color-white)",
              color: "var(--color-green)",
            }}
            onClick={authenticatedToModal}
          >
            Create Event
          </button>
        </div>

        <SDGslider />
        <EventsList filter={filter.filter} />
      </div>
      {showModal && <EventModal onClose={() => setShowModal(false)} />}
    </>
  );
}

export default EventsPage;
