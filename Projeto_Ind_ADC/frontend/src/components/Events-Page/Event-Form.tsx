import { useState } from "react";
import type { RequestEventCreation } from "../../utils/types";
import { createEvent } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import { usePlacesAutocomplete } from "../../api/places";

function EventForm() {
  //========== Hook ==========
  const [startDateInput, setStartDateInput] = useState("");
  const [formData, setFormData] = useState<RequestEventCreation>({
    token: { jwt: "" },
    input: {
      title: "",
      description: "",
      category: "",
      location: "",
      startDate: -1,
      durationMinutes: -1,
      maxAttendees: -1,
      minAttendees: -1,
      public: false,
    },
  });

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    startDate: "",
    durationMinutes: "",
    maxAttendees: "",
    minAttendees: "",
  });

  const categories = [
    "MUSIC",
    "SPORTS",
    "TECH",
    "ART",
    "FOOD",
    "BUSINESS",
    "COMMUNITY",
    "OTHER",
  ];

  //========== Receber Input e Limpar erros ==========
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      input: {
        ...prev.input,
        [name]: type === "number" ? (value === "" ? -1 : Number(value)) : value,
      },
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleCategorySelect = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      input: {
        ...prev.input,
        category,
      },
    }));

    setErrors((prev) => ({
      ...prev,
      category: "",
    }));
  };

  const dateToLong = (dateString: string): number => {
    const [day, month, year] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day).getTime();
  };

  //========== Submissão dos Campos ==========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      title: "",
      description: "",
      location: "",
      category: "",
      startDate: "",
      durationMinutes: "",
      maxAttendees: "",
      minAttendees: "",
    };

    if (!formData.input.title) {
      newErrors.title = "Title is required";
    } else if (formData.input.title.length > 100) {
      newErrors.title = "Need to be less than 100 letters";
    }
    if (!formData.input.description)
      newErrors.description = "Description is required";
    if (!formData.input.location) {
      newErrors.location = "Location is required";
    }
    if (!formData.input.category) {
      newErrors.category = "Category is required";
    }
    if (formData.input.startDate <= 0) {
      newErrors.startDate = "Start Date is required";
    }

    if (formData.input.durationMinutes <= 0) {
      newErrors.durationMinutes = "Duration is required";
    }

    if (formData.input.maxAttendees <= 0) {
      newErrors.maxAttendees = "Number of Max Attendees is required";
    }

    if (formData.input.minAttendees <= 0) {
      newErrors.minAttendees = "Number of Min Attendees is required";
    }
    if (
      formData.input.minAttendees > 0 &&
      formData.input.maxAttendees > 0 &&
      formData.input.minAttendees > formData.input.maxAttendees
    ) {
      newErrors.minAttendees =
        "Min attendees cannot be greater than max attendees";
    }

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error !== "");
    if (hasErrors) return;

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }
      const payload: RequestEventCreation = {
        ...formData,
        token: {
          jwt: token,
        },
      };
      console.log(payload);
      const response = await createEvent(payload);
      navigate("/events");
    } catch (err) {
      console.log("Something went wrong!");
    }
  };

  const mapsApiKey = import.meta.env.VITE_API_KEY;

  const {
    inputValue: locationInputValue,
    predictions: locationPredictions,
    loading: locationLoading,
    handleInputChange: handleLocationInputChange,
    handleSelect: handleLocationSelect,
  } = usePlacesAutocomplete({
    apiKey: mapsApiKey,
    value: formData.input.location,
    onChange: (value) => {
      setFormData((prev) => ({
        ...prev,
        input: {
          ...prev.input,
          location: value,
        },
      }));

      setErrors((prev) => ({
        ...prev,
        location: "",
      }));
    },
    onSelect: (prediction) => {
      setFormData((prev) => ({
        ...prev,
        input: {
          ...prev.input,
          location: prediction.description,
        },
      }));

      setErrors((prev) => ({
        ...prev,
        location: "",
      }));
    },
  });

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label is-invalid">Title:</label>
          <input
            type="text"
            name="title"
            className={`form-control  ${errors.title ? "is-invalid" : ""}`}
            value={formData.input.title}
            onChange={handleChange}
            placeholder="My Event..."
          />
          {errors.title && (
            <div className="invalid-feedback">{errors.title}</div>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Description:</label>
          <textarea
            name="description"
            className={`form-control  ${errors.description ? "is-invalid" : ""}`}
            value={formData.input.description}
            onChange={handleChange}
            maxLength={300}
            placeholder="Write up to 300 characters..."
          />
          {errors.description && (
            <div className="invalid-feedback">{errors.description}</div>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Location:</label>

          <div className="position-relative">
            <input
              type="text"
              name="location"
              className={`form-control ${errors.location ? "is-invalid" : ""}`}
              value={locationInputValue}
              onChange={handleLocationInputChange}
              placeholder="Enter the event location..."
              autoComplete="off"
            />

            {locationLoading && (
              <div className="form-text mt-1">Searching...</div>
            )}

            {errors.location && (
              <div className="invalid-feedback d-block">{errors.location}</div>
            )}

            {locationPredictions.length > 0 && (
              <ul
                className="list-group position-absolute w-100 mt-1 shadow-sm"
                style={{ zIndex: 1050 }}
              >
                {locationPredictions.map((prediction) => (
                  <li
                    key={prediction.placeId}
                    className="list-group-item list-group-item-action"
                  >
                    <button
                      type="button"
                      className="btn p-0 text-start w-100"
                      onClick={() => handleLocationSelect(prediction)}
                    >
                      {prediction.description}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Category:</label>

          <div className="input-group mb-3">
            <button
              className="btn btn-outline-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Options
            </button>

            <ul className="dropdown-menu">
              {categories.map((category) => (
                <li key={category}>
                  <button
                    className="dropdown-item"
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>

            <input
              type="text"
              className="form-control"
              value={formData.input.category}
              readOnly
              aria-label="Selected category"
              placeholder="Selected category..."
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Start Date:</label>
          <input
            type="date"
            name="startDate"
            className={`form-control  ${errors.startDate ? "is-invalid" : ""}`}
            value={startDateInput}
            onChange={(e) => {
              const value = e.target.value;

              setStartDateInput(value);

              setFormData((prev) => ({
                ...prev,
                input: {
                  ...prev.input,
                  startDate: dateToLong(value),
                },
              }));

              setErrors((prev) => ({
                ...prev,
                startDate: "",
              }));
            }}
            placeholder="Enter the event location..."
          />
          {errors.startDate && (
            <div className="invalid-feedback">{errors.startDate}</div>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Duration (in Minutes):</label>
          <input
            type="number"
            name="durationMinutes"
            className={`form-control  ${errors.durationMinutes ? "is-invalid" : ""}`}
            value={formData.input.durationMinutes}
            onChange={handleChange}
          />
          {errors.durationMinutes && (
            <div className="invalid-feedback">{errors.durationMinutes}</div>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Number Min of Attendees:</label>
          <input
            type="number"
            name="minAttendees"
            className={`form-control  ${errors.minAttendees ? "is-invalid" : ""}`}
            value={formData.input.minAttendees}
            onChange={handleChange}
          />
          {errors.minAttendees && (
            <div className="invalid-feedback">{errors.minAttendees}</div>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Number Max of Attendees:</label>
          <input
            type="number"
            name="maxAttendees"
            className={`form-control  ${errors.maxAttendees ? "is-invalid" : ""}`}
            value={formData.input.maxAttendees}
            onChange={handleChange}
          />
          {errors.maxAttendees && (
            <div className="invalid-feedback">{errors.maxAttendees}</div>
          )}
        </div>
        <div className="mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="public"
            name="public"
            checked={formData.input.public}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                input: {
                  ...prev.input,
                  public: e.target.checked,
                },
              }))
            }
          />

          <label className="form-check-label" htmlFor="isPublic">
            Public event
          </label>
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
