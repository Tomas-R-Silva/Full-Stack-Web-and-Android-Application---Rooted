import { useState } from "react";
import type {
  RequestEventCreation,
  ImageUploadResponse,
} from "../../utils/types";
import { createEvent, uploadImage } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import { usePlacesAutocomplete } from "../../api/places";
import { sdgInfos } from "../../utils/sdgInfo";
import { useMapsPage } from "../../api/maps";
import { useNotification } from "../NotificationContext";
import accessible_w from "../../assets/icons/accessible_w.svg";

type ErrorState = {
  [K in keyof RequestEventCreation["input"]]: string;
};

function EventForm() {
  const mapsApiKey = import.meta.env.VITE_API_KEY;
  const { geocodeAddress } = useMapsPage(mapsApiKey);
  //========== Hook ==========
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

  const [selectedSDGs, setSelectedSDGs] = useState<number[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [formData, setFormData] = useState<RequestEventCreation>({
    token: { jwt: "" },
    input: {
      title: "",
      description: "",
      category: "",
      location: "",
      startDate: Date.now(),
      durationMinutes: 0,
      maxAttendees: 0,
      minAttendees: 0,
      public: false,
      accessible: false,
      sdg: [],
      lat: null,
      lng: null,
    },
  });
  const [errors, setErrors] = useState<ErrorState>({
    title: "",
    description: "",
    category: "",
    location: "",
    startDate: "",
    durationMinutes: "",
    maxAttendees: "",
    minAttendees: "",
    public: "",
    accessible: "",
    sdg: "",
    lat: "",
    lng: "",
  });

  //========== Receber Input e Limpar erros ==========
  const navigate = useNavigate();
  const { notify } = useNotification();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    let newValue: string | number | boolean;

    if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (name === "startDate") {
      newValue = Math.floor(new Date(value).getTime());
    } else if (type === "number") {
      newValue = value === "" ? 0 : Number(value);
    } else {
      newValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      input: {
        ...prev.input,
        [name]: newValue,
      },
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleImage = (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;

      setSelectedImages((prev) => [...prev, base64]);
    };

    reader.readAsDataURL(file);
  };

  const deleteImage = (image: string) => {
    setSelectedImages((prev) => prev.filter((img) => img !== image));
  };

  const selectCover = (image: string) => {
    setSelectedImages((prev) => {
      const filtered = prev.filter((img) => img !== image);
      return [image, ...filtered];
    });
  };

  const toggleSDG = (id: number) => {
    setSelectedSDGs((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((sdgId) => sdgId !== id)
        : [...prev, id];

      setFormData((prevForm) => ({
        ...prevForm,
        input: {
          ...prevForm.input,
          sdg: updated,
        },
      }));

      return updated;
    });
  };

  //========== Submissão dos Campos ==========
  const handleImagesUpload = async (eventId: string) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }

      const res: ImageUploadResponse = await uploadImage({
        token: { jwt: token },
        input: {
          eventId: eventId,
          images: selectedImages,
        },
      });
      console.log({
        token: { jwt: token },
        input: {
          eventId: eventId,
          images: selectedImages,
        },
      });
      console.log(res.data.message);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      title: "",
      description: "",
      category: "",
      location: "",
      startDate: "",
      durationMinutes: "",
      maxAttendees: "",
      minAttendees: "",
      public: "",
      accessible: "",
      sdg: "",
      lat: "",
      lng: "",
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

    if (formData.input.minAttendees < 0) {
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

    console.log(errors);

    const hasErrors = Object.values(newErrors).some((error) => error !== "");
    if (hasErrors) return;

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }

      console.log("a");

      const position = await geocodeAddress(formData.input.location);
      if (!position) {
        setErrors((prev) => ({
          ...prev,
          location:
            "Could not find this location, please pick a different address",
        }));
        return;
      }

      const payload: RequestEventCreation = {
        ...formData,
        input: {
          ...formData.input,
          lat: position.lat,
          lng: position.lng,
        },
        token: {
          jwt: token,
        },
      };
      console.log(payload);
      const response = await createEvent(payload);
      console.log(response);
      handleImagesUpload(response.data.eventId);
      navigate("/events/" + response.data.eventId);
      window.location.reload();
      if (response.status === 200) {
        notify("EVENT_CREATED");
      }
    } catch (err) {
      console.log("Something went wrong!");
    }
  };

  const {
    inputValue: locationInputValue,
    predictions: locationPredictions,
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
      <div
        className="container py-1"
        style={{ background: "var(--color-white)" }}
      >
        <div className="row w-100 justify-content-center">
          <h1
            className="fw-bold mb-3"
            style={{
              color: "var(--color-green)",
            }}
          >
            Event Creation Panel:
          </h1>
          <div className="input-group mb-3">
            <span
              className="input-group-text"
              style={{
                background: "var(--color-green2)",
                color: "var(--color-white)",
              }}
            >
              Title
            </span>
            <input
              type="text"
              name="title"
              className={`form-control  ${errors.title ? "is-invalid" : ""}`}
              value={formData.input.title}
              onChange={handleChange}
              placeholder="Enter the event title..."
            />
            {errors.title && (
              <div className="invalid-feedback">{errors.title}</div>
            )}
          </div>

          <div className="input-group mb-3">
            <span
              className="input-group-text"
              style={{
                background: "var(--color-green2)",
                color: "var(--color-white)",
              }}
            >
              Location
            </span>

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

              {errors.location && (
                <div className="invalid-feedback d-block">
                  {errors.location}
                </div>
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

          <div className="input-group mb-3">
            <span
              className="input-group-text"
              style={{
                background: "var(--color-green2)",
                color: "var(--color-white)",
              }}
            >
              Date & Time
            </span>
            <input
              type="datetime-local"
              name="startDate"
              className={`form-control  ${errors.startDate ? "is-invalid" : ""}`}
              value={
                formData.input.startDate
                  ? new Date(formData.input.startDate)
                      .toISOString()
                      .slice(0, 16)
                  : ""
              }
              onChange={handleChange}
            />
            {errors.startDate && (
              <div className="invalid-feedback">{errors.startDate}</div>
            )}
          </div>

          <div className="input-group mb-3">
            <span
              className="input-group-text"
              style={{
                background: "var(--color-green2)",
                color: "var(--color-white)",
              }}
            >
              Duration
            </span>
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
            <span
              className="input-group-text"
              style={{
                background: "var(--color-green2)",
                color: "var(--color-white)",
              }}
            >
              minutes
            </span>
          </div>

          <div className="input-group mb-3">
            <span
              className="input-group-text"
              style={{
                background: "var(--color-green2)",
                color: "var(--color-white)",
              }}
            >
              Minimum Vacancies:
            </span>
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
            <span
              className="input-group-text"
              style={{
                background: "var(--color-green2)",
                color: "var(--color-white)",
              }}
            >
              Maximum Vacancies
            </span>
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
            <span
              className="input-group-text"
              style={{
                background: "var(--color-green2)",
                color: "var(--color-white)",
              }}
            >
              people
            </span>
          </div>

          <div className="d-flex gap-4 mb-3">
            <div className="form-check">
              <input
                type="checkbox"
                name="public"
                className="form-check-input"
                checked={formData.input.public}
                onChange={handleChange}
              />
              <label
                className="form-check-label"
                style={{
                  color: "var(--color-green)",
                }}
              >
                Public
              </label>
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                name="accessible"
                className="form-check-input"
                checked={formData.input.accessible ?? false}
                onChange={handleChange}
              />
              <label
                className="form-check-label"
                style={{
                  color: "var(--color-green)",
                }}
              >
                Accessible{" "}
                <span
                  className="badge ms-2"
                  style={{
                    background: "var(--color-ods16)",
                    color: "var(--color-white)",
                  }}
                >
                  <img
                    src={accessible_w}
                    style={{ width: "12px", height: "12px" }}
                  />
                </span>
              </label>
            </div>
          </div>

          <div className="input-group">
            <span
              className="input-group-text"
              style={{
                background: "var(--color-green2)",
                color: "var(--color-white)",
              }}
            >
              Description
            </span>
            <textarea
              name="description"
              className={`form-control  ${errors.description ? "is-invalid" : ""}`}
              value={formData.input.description}
              onChange={handleChange}
              maxLength={1000}
              placeholder="Write up to 1000 characters..."
            />
          </div>

          <div className="row g-3 mt-2">
            <h5
              style={{
                color: "var(--color-green)",
              }}
            >
              Category:
            </h5>
            <select
              className="form-select"
              name="category"
              value={formData.input.category ?? ""}
              onChange={handleChange}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="row g-3 mt-2">
            <h5
              style={{
                color: "var(--color-green)",
              }}
            >
              Sustainable Development Goals:
            </h5>
            {sdgInfos.map((sdg) => (
              <div key={sdg.id} className="col-6 col-md-3 col-lg-2">
                <div
                  className={"card h-100 text-center"}
                  style={{
                    cursor: "pointer",
                    transition: "0.2s",
                    backgroundColor: selectedSDGs.includes(sdg.id)
                      ? "var(--color-green2)"
                      : "white",
                  }}
                  onClick={() => toggleSDG(sdg.id)}
                >
                  <img
                    src={sdg.image}
                    alt={sdg.title}
                    className="card-img-top p-2"
                    style={{
                      height: "70px",
                      width: "100%",
                      objectFit: "contain",
                    }}
                  />

                  <div className="card-body p-2">
                    <small
                      style={{
                        color: selectedSDGs.includes(sdg.id)
                          ? "var(--color-white)"
                          : "var(--color-green2)",
                      }}
                    >
                      {sdg.title}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="row g-3 mt-2">
            <h5
              style={{
                color: "var(--color-green)",
              }}
            >
              Event Images:
            </h5>
            <input
              type="file"
              accept="image/*"
              multiple
              className="form-control mb-3"
              style={{
                color: "var(--color-green)",
              }}
              onChange={(e) => {
                if (!e.target.files) return;

                Array.from(e.target.files).forEach(handleImage);
              }}
            />

            {selectedImages.map((image) => (
              <div key={image} className="col-6 col-md-3 col-lg-2">
                <div
                  className="card h-100 text-center"
                  style={{
                    cursor: "pointer",
                    transition: "0.2s",
                    backgroundColor:
                      selectedImages[0] === image
                        ? "var(--color-green2)"
                        : "white",
                  }}
                >
                  <img
                    src={image}
                    alt="event"
                    className="card-img-top p-2"
                    style={{
                      height: "70px",
                      width: "100%",
                      objectFit: "contain",
                    }}
                  />

                  <div
                    className="card-body p-2"
                    onClick={() => selectCover(image)}
                  >
                    <small style={{ color: "var(--color-gold)" }}>
                      {selectedImages[0] === image
                        ? "Cover image"
                        : "Select as cover"}
                    </small>
                  </div>

                  <div
                    className="card-body p-2"
                    onClick={() => deleteImage(image)}
                  >
                    <small style={{ color: "var(--color-ods1)" }}>Delete</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="row g-3 mt-2">
            <button
              type="submit"
              className="btn text-white fw-bold px-4"
              style={{ background: "var(--color-green2)" }}
              onClick={handleSubmit}
            >
              Create Event
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default EventForm;
