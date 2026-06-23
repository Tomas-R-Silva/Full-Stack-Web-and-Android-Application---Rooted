import { useState } from "react";
import EventForm from "./Event-Form";

function EventModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal d-block">
      <div className="modal-dialog modal-dialog-centered">
        <div
          className="modal-content"
          style={{
            background: "var(--color-bege)",
            border: "4px solid var(--color-green)",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <div
            className="modal-header"
            style={{
              background: "var(--color-bege)",
              borderBottom: "4px solid var(--color-green)",
            }}
          >
            <h5 className="modal-title" style={{ color: "var(--color-green)" }}>
              Create an Event
            </h5>

            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div
            className="modal-body"
            style={{
              background: "var(--color-bege)",
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
