import { useState } from "react";
import ProfileCompleteProgress from "./Profile-CompleteProgress";
import ProfileComplete1 from "./Profile-Complete1";
import ProfileComplete2 from "./Profile-Complete2";
import ProfileComplete3 from "./Profile-Complete3";

function ProfileCompleteModal({ onClose }: { onClose: () => void }) {
  //========== Hook ==========
  const [step, setStep] = useState(1);

  //========== Auxiliar Functions ==========
  const nextStep = () => setStep((prev) => prev + 1);
  const lastStep = () => setStep((prev) => prev - 1);

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
            {step === 1 && (
              <h5
                className="modal-title"
                style={{ color: "var(--color-green)" }}
              >
                Choose your avatar
              </h5>
            )}
            {step === 2 && (
              <h5
                className="modal-title"
                style={{ color: "var(--color-green)" }}
              >
                Add a biography
              </h5>
            )}
            {step === 3 && (
              <h5
                className="modal-title"
                style={{ color: "var(--color-green)" }}
              >
                Meet some friends
              </h5>
            )}
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div
            className="modal-body"
            style={{
              background: "var(--color-bege)",
              borderBottom: "4px solid var(--color-green)",
            }}
          >
            <ProfileCompleteProgress step={step} />
            {step === 1 && <ProfileComplete1 />}
            {step === 2 && <ProfileComplete2 />}
            {step === 3 && <ProfileComplete3 />}
          </div>

          <div
            className="modal-footer"
            style={{
              background: "var(--color-bege)",
            }}
          >
            {step !== 1 && (
              <button
                className="btn"
                style={{
                  background: "var(--color-green)",
                  color: "var(--color-bege)",
                }}
                onClick={lastStep}
              >
                Last Section
              </button>
            )}
            {step !== 3 && (
              <button
                className="btn"
                style={{
                  background: "var(--color-green)",
                  color: "var(--color-bege)",
                }}
                onClick={nextStep}
              >
                Next Section
              </button>
            )}
            {step === 3 && (
              <button
                type="submit"
                className="btn fw-bold"
                style={{
                  border: "3px solid var(--color-green)",
                  background: "var(--color-white)",
                  color: "var(--color-green)",
                }}
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileCompleteModal;
