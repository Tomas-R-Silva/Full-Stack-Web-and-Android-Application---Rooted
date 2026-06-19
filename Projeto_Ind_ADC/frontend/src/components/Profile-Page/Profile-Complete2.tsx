import { useState } from "react";

function ProfileComplete2() {
  const [bio, setBio] = useState("");

  const handleChange = (e: any) => {
    const value = e.target.value;

    if (value.length <= 300) {
      setBio(value);
    }
  };

  return (
    <>
      <h6 style={{ color: "var(--color-green)" }}>Biography:</h6>

      <div className="input-group">
        <textarea
          className="form-control"
          value={bio}
          onChange={handleChange}
          maxLength={300}
          placeholder="Write up to 300 characters..."
        />
      </div>

      <small>{bio.length}/300 characters</small>
    </>
  );
}

export default ProfileComplete2;
