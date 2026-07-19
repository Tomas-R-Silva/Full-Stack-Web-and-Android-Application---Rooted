import { useState } from "react";
import EventForm from "./Event-Form";
import EventUpdater from "./Event-Updater";

function EventModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal d-block">
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div
          className="modal-content"
          style={{
            overflow: "hidden",
            borderRadius: "12px",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
          }}
        >
          <div
            className="modal-header"
            style={{
              background: "var(--color-green)",
            }}
          >
            <h5 className="modal-title" style={{ color: "var(--color-white)" }}>
              Create an Event
            </h5>

            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            />
          </div>

          <div
            className="modal-body"
            style={{
              background: "var(--color-white)",
            }}
          >
            <EventForm />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventModal;
