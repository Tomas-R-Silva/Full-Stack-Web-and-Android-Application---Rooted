import ProfileCompleteModal from "./Profile-CompleteModal";
import { useState } from "react";

function ProfilePage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        style={{
          filter: showModal ? "blur(4px)" : "none",
          transition: "filter 0.2s",
        }}
      >
        <button onClick={() => setShowModal(true)}>
          Lets Complete your profile
        </button>
      </div>

      {showModal && (
        <ProfileCompleteModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

export default ProfilePage;
