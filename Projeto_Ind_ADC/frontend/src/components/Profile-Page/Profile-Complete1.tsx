import { useRef } from "react";
import { useState } from "react";
import type { ChangeEvent } from "react";
import type { accountProps } from "../../utils/types";

function ProfileComplete1({ onNext }: accountProps) {
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <>
      <div className="d-flex flex-column align-items-center">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center overflow-hidden"
          style={{
            width: "150px",
            height: "150px",
            cursor: "pointer",
            backgroundColor: "var(--color-white)",
            border: "4px solid var(--color-green)",
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          {image ? (
            <img
              src={image}
              alt="Profile"
              className="w-100 h-100"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <span
              className="text fw-bold"
              style={{ color: "var(--color-green)", fontSize: 20 }}
            >
              Click here
            </span>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="d-none"
          onChange={handleImageChange}
        />
      </div>
    </>
  );
}

export default ProfileComplete1;
