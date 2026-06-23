import { useState } from "react";
import type { RequestEventCreation } from "../../utils/types";

function EventForm() {
  //========== Hook ==========
  const [formData, setFormData] = useState<RequestEventCreation>({
    token: { jwt: "" },
    title: "",
    description: "",
    category: "", // MUSIC|SPORTS|TECH|ART|FOOD|BUSINESS|COMMUNITY|OTHER
    location: "",
    startDate: -1,
    durationMinutes: -1,
    maxAttendees: -1,
    isPublic: false,
  });

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    location: "",
  });

  //========== Receber Input e Limpar erros ==========
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  //========== Submissão dos Campos ==========
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { title: "", description: "", location: "" };

    if (!formData.title) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 100) {
      newErrors.title = "Need to be less than 100 letters";
    }
    if (!formData.description)
      newErrors.description = "Description is required";
    if (!formData.location) {
      newErrors.location = "Location is required";
    }

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error !== "");
    if (hasErrors) return;
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label is-invalid">Title</label>
          <input
            type="text"
            name="title"
            className={`form-control  ${errors.title ? "is-invalid" : ""}`}
            value={formData.title}
            onChange={handleChange}
            placeholder="My Event"
          />
          {errors.title && (
            <div className="invalid-feedback">{errors.title}</div>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            className={`form-control  ${errors.description ? "is-invalid" : ""}`}
            value={formData.description}
            onChange={handleChange}
            maxLength={300}
            placeholder="Write up to 300 characters..."
          />
          {errors.description && (
            <div className="invalid-feedback">{errors.description}</div>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Location</label>
          <input
            type="text"
            name="location"
            className={`form-control  ${errors.location ? "is-invalid" : ""}`}
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter the event location"
          />
          {errors.location && (
            <div className="invalid-feedback">{errors.location}</div>
          )}
        </div>
        <div className="d-flex justify-content-end mt-3">
          <button
            type="submit"
            className="btn rounded-pill"
            style={{
              background: "var(--color-green)",
              color: "var(--color-bege)",
            }}
          >
            Next Section
          </button>
        </div>
      </form>
    </>
  );
}

export default EventForm;
