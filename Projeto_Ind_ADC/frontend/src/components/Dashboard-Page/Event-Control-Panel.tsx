import type {
  EventProps,
  ImageDeleteResponse,
  RequestEventCancel,
  RequestEventDelete,
} from "../../utils/types";
import { sdgInfos } from "../../utils/sdgInfo";
import { useState, useEffect } from "react";
import type {
  RequestEventUpdate,
  AddPartnerResponse,
  RemovePartnerResponse,
} from "../../utils/types";

import {
  updateEvent,
  addPartner,
  removePartner,
  deleteImage,
  uploadImageURL,
  uploadImage,
  deleteEvent,
  cancelEvent,
} from "../../api/auth";
import type { Image } from "../../utils/types";
import { useMapsPage } from "../../api/maps";
import { usePlacesAutocomplete } from "../../api/places";
import { useNavigate } from "react-router-dom";

type ErrorState = {
  [K in keyof RequestEventUpdate["input"]]: string;
};

function EventControlPanel({ event }: EventProps) {
  //========== Hooks ==========
  const mapsApiKey = import.meta.env.VITE_API_KEY;
  const { geocodeAddress } = useMapsPage(mapsApiKey);
  //========== Hooks ==========
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

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [partner, setPartner] = useState<string>();
  const navigate = useNavigate();
  const [originalLocation, setOriginalLocation] = useState<string>("");
  const [selectedSDGs, setSelectedSDGs] = useState<number[]>([]);
  const [selectedImages, setSelectedImages] = useState<(Image | string)[]>([]);
  const [formData, setFormData] = useState<RequestEventUpdate>({
    token: { jwt: "" },
    input: {
      eventId: "",
      title: "",
      description: "",
      category: "",
      location: "",
      startDate: -1,
      durationMinutes: -1,
      maxAttendees: -1,
      minAttendees: -1,
      public: false,
      isAccessible: false,
      sdg: [],
      lat: null,
      lng: null,
    },
  });
  const [errors, setErrors] = useState<ErrorState>({
    eventId: "",
    title: "",
    description: "",
    category: "",
    location: "",
    startDate: "",
    durationMinutes: "",
    maxAttendees: "",
    minAttendees: "",
    public: "",
    isAccessible: "",
    sdg: "",
    lat: "",
    lng: "",
  });

  //========== Handles: Receber Input e Limpar erros ==========

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    const newValue =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : type === "number"
          ? value === ""
            ? 0
            : Number(value)
          : value;

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
      setSelectedImages((prev) => [...prev, reader.result as string]);
    };

    reader.readAsDataURL(file);
  };

  const handleDeleteImage = (image: Image | string) => {
    setSelectedImages((prev) =>
      prev.filter((img) => {
        if (typeof img === "string" && typeof image === "string") {
          return img !== image;
        }

        if (typeof img !== "string" && typeof image !== "string") {
          return img.id !== image.id;
        }

        return img !== image;
      }),
    );
  };

  const selectCover = (image: Image | string) => {
    setSelectedImages((prev) => {
      const rest = prev.filter((img) => {
        if (typeof img === "string" && typeof image === "string")
          return img !== image;

        if (typeof img !== "string" && typeof image !== "string")
          return img.id !== image.id;

        return img !== image;
      });

      return [image, ...rest];
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

  const handleImagesUpload = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token || !event || selectedImages.length === 0) return;

      const cover = selectedImages[0];

      if (typeof cover === "string") {
        if (cover.startsWith("data:image/")) {
          await uploadImage({
            token: { jwt: token },
            input: {
              eventId: event.eventId,
              images: [cover],
            },
          });
        } else {
          await uploadImageURL({
            token: { jwt: token },
            input: {
              eventId: event.eventId,
              images: [cover],
            },
          });
        }
      } else {
        await uploadImageURL({
          token: { jwt: token },
          input: {
            eventId: event.eventId,
            images: [cover.url],
          },
        });
      }

      const remaining = selectedImages.slice(1);

      const remaining64 = remaining.filter(
        (img): img is string =>
          typeof img === "string" && img.startsWith("data:image/"),
      );

      const remainingURL = remaining
        .filter((img) =>
          typeof img === "string" ? img.startsWith("http") : true,
        )
        .map((img) => (typeof img === "string" ? img : img.url));

      if (remaining64.length > 0) {
        const res = await uploadImage({
          token: { jwt: token },
          input: {
            eventId: event.eventId,
            images: remaining64,
          },
        });

        console.log("Base64:", res.data.message);
      }

      if (remainingURL.length > 0) {
        const res = await uploadImageURL({
          token: { jwt: token },
          input: {
            eventId: event.eventId,
            images: remainingURL,
          },
        });

        console.log("URLs:", res.data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImagesDelete = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token || !event) return;

      console.log(event.imageUrls);

      const res: ImageDeleteResponse = await deleteImage({
        token: { jwt: token },
        input: {
          eventId: event.eventId,
          imageIds: event.imageUrls.map((image) => image.id),
        },
      });
      console.log(res.data.message);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPartner = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }
      if (!partner || !event) {
        console.log("Invalid partenr or event");
        return;
      }

      const res: AddPartnerResponse = await addPartner({
        token: { jwt: token },
        input: {
          username: partner,
          eventId: event.eventId,
        },
      });
      console.log(res.data.message);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemovePartner = async (partnerToRemove: string) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }
      if (!partner || !event) {
        console.log("Invalid partenr or event");
        return;
      }

      const res: RemovePartnerResponse = await removePartner({
        token: { jwt: token },
        input: {
          username: partnerToRemove,
          eventId: event.eventId,
        },
      });
      console.log(res.data.message);
    } catch (err) {
      console.error(err);
    }
  };

  //========== Submissão dos Campos ==========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      eventId: "",
      title: "",
      description: "",
      category: "",
      location: "",
      startDate: "",
      durationMinutes: "",
      maxAttendees: "",
      minAttendees: "",
      public: "",
      isAccessible: "",
      SDG: "",
      lat: "",
      lng: "",
    };

    if (formData.input.title && formData.input.title.length > 100) {
      newErrors.title = "Must be less than 100 characters";
    }

    if (
      formData.input.description &&
      formData.input.description.length > 1000
    ) {
      newErrors.description = "Must be less than 300 characters";
    }

    if (formData.input.durationMinutes && formData.input.durationMinutes <= 0) {
      newErrors.durationMinutes = "Duration must be greater than 0";
    }

    if (formData.input.maxAttendees) {
      if (formData.input.maxAttendees <= 0) {
        newErrors.maxAttendees = "Max attendees must be greater than 0";
      } else if (
        formData.input.minAttendees > 0 &&
        formData.input.maxAttendees < formData.input.minAttendees
      ) {
        newErrors.maxAttendees =
          "Max attendees cannot be less than min attendees";
      }
    }

    if (formData.input.minAttendees) {
      if (formData.input.minAttendees <= 0) {
        newErrors.minAttendees = "Min attendees must be greater than 0";
      } else if (
        formData.input.maxAttendees > 0 &&
        formData.input.minAttendees > formData.input.maxAttendees
      ) {
        newErrors.minAttendees =
          "Min attendees cannot be greater than max attendees";
      }
    }

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error !== "");
    if (hasErrors) return;

    if (event?.imageUrls?.length) {
      await handleImagesDelete();
    }

    if (selectedImages.length) {
      await handleImagesUpload();
    }

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }

      let lat = formData.input.lat;
      let lng = formData.input.lng;

      if (
        formData.input.location &&
        formData.input.location !== originalLocation
      ) {
        const position = await geocodeAddress(formData.input.location);
        if (!position) {
          setErrors((prev) => ({
            ...prev,
            location:
              "Could not find this location, please pick a different address",
          }));
          return;
        }
        lat = position.lat;
        lng = position.lng;
      }

      const payload: RequestEventUpdate = {
        ...formData,
        input: {
          ...formData.input,
          lat,
          lng,
        },
        token: {
          jwt: token,
        },
      };
      console.log(payload);
      const response = await updateEvent(payload);
      console.log(response);
      window.location.reload();
    } catch (err) {
      console.log("Something went wrong!");
    }
  };

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }

      if (!event) {
        console.log("Event Invalid");
        return;
      }

      const payload: RequestEventCancel = {
        token: {
          jwt: token,
        },
        input: {
          eventId: event.eventId,
        },
      };
      console.log(payload);
      const response = await cancelEvent(payload);
      console.log(response);
      navigate("/events/" + event.eventId);
      window.location.reload();
    } catch (err) {
      console.log("Something went wrong!");
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }

      if (!event) {
        console.log("Event Invalid");
        return;
      }

      const payload: RequestEventDelete = {
        token: {
          jwt: token,
        },
        input: {
          eventId: event.eventId,
        },
      };
      console.log(payload);
      const response = await deleteEvent(payload);
      console.log(response);
      navigate("/events");
      window.location.reload();
    } catch (err) {
      console.log("Something went wrong!");
    }
  };

  useEffect(() => {
    if (!event) return;

    setFormData({
      token: { jwt: "" },
      input: {
        eventId: event.eventId,
        title: event.title,
        description: event.description,
        category: event.category,
        location: event.location,
        startDate: event.startDate,
        durationMinutes: event.durationMinutes,
        maxAttendees: event.maxAttendees,
        minAttendees: event.minAttendees,
        public: event.isPublic,
        isAccessible: event.isAccessible ?? false,
        sdg: event.SDG ?? [],
        lat: event.lat,
        lng: event.lng,
      },
    });

    setOriginalLocation(event.location);
    setSelectedSDGs(event.SDG ?? []);
    setSelectedImages(event.imageUrls ?? []);
  }, [event]);

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
      <div className="container">
        <div className="row w-100 justify-content-center">
          <a
            style={{
              color: "var(--color-green)",
              fontSize: "16px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/events/" + event.eventId)}
          >
            ← Event Page
          </a>
          <h1
            className="fw-bold mb-3"
            style={{
              color: "var(--color-green)",
            }}
          >
            Event Control Panel:
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
              className="form-control"
              value={formData.input.title ?? ""}
              onChange={handleChange}
            />
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
                className="form-control"
                value={locationInputValue}
                onChange={handleLocationInputChange}
              />
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
              type="date"
              className="form-control"
              placeholder={String(event?.startDate)}
            />
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
              className="form-control"
              value={formData.input.durationMinutes ?? ""}
              onChange={handleChange}
            />
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
              className="form-control"
              value={formData.input.minAttendees ?? ""}
              onChange={handleChange}
            />
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
              className="form-control"
              value={formData.input.maxAttendees ?? ""}
              onChange={handleChange}
            />
            <span
              className="input-group-text"
              style={{
                background: "var(--color-green2)",
                color: "var(--color-white)",
              }}
            >
              persons
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
                defaultChecked={event?.isPublic}
              >
                Public
              </label>
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                name="isAccessible"
                className="form-check-input"
                checked={formData.input.isAccessible ?? false}
                onChange={handleChange}
              />
              <label
                className="form-check-label"
                style={{
                  color: "var(--color-green)",
                }}
                defaultChecked={event?.isAccessible}
              >
                Accessible
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
              className="form-control"
              value={formData.input.description ?? ""}
              onChange={handleChange}
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

            {selectedImages.map((image) => {
              const src = typeof image === "string" ? image : image.url;
              const key = typeof image === "string" ? image : image.id;
              const isCover = selectedImages[0] === image;

              return (
                <div key={key} className="col-6 col-md-3 col-lg-2">
                  <div
                    className="card h-100 text-center"
                    style={{
                      cursor: "pointer",
                      transition: "0.2s",
                      backgroundColor: isCover
                        ? "var(--color-green2)"
                        : "white",
                    }}
                  >
                    <img
                      src={src}
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
                        {isCover ? "Cover image" : "Select as cover"}
                      </small>
                    </div>

                    <div
                      className="card-body p-2"
                      onClick={() => handleDeleteImage(image)}
                    >
                      <small style={{ color: "var(--color-ods1)" }}>
                        Delete
                      </small>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="row g-3 mt-2">
            <h5 style={{ color: "var(--color-green)" }}>Partners</h5>
            <div className="card p-3 mb-3">
              <div className="d-flex gap-2 mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter username..."
                  value={partner ?? ""}
                  onChange={(e) => setPartner(e.target.value)}
                />

                <button
                  className="btn"
                  style={{
                    background: "var(--color-green2)",
                    color: "white",
                    minWidth: "90px",
                  }}
                  onClick={handleAddPartner}
                >
                  Add
                </button>
              </div>

              {event?.partners?.length ? (
                <div className="list-group">
                  {event.partners.map((partner) => (
                    <div
                      key={partner}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{partner}</strong>
                      </div>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemovePartner(partner)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">No partners added yet.</p>
              )}
            </div>
          </div>
          <div className="row g-3 mt-2">
            <button
              type="submit"
              className="btn text-white fw-bold px-4"
              style={{ background: "var(--color-green2)" }}
              onClick={handleSubmit}
            >
              Save Changes
            </button>
          </div>
          <div className="row g-3 mt-2">
            <div>
              {!confirmCancel && (
                <button
                  className="btn btn-danger fw-bold px-4"
                  onClick={() => setConfirmCancel(true)}
                >
                  Cancel Event
                </button>
              )}
              {confirmCancel && (
                <>
                  <button
                    className="btn btn-danger fw-bold"
                    onClick={() => setConfirmCancel(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn fw-bold ms-1"
                    style={{
                      background: "var(--color-green2)",
                      color: "var(--color-white)",
                    }}
                    onClick={handleCancel}
                  >
                    Confirm
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="row g-3 mt-2">
            <div>
              {!confirmDelete && (
                <button
                  className="btn btn-danger fw-bold px-4"
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete Event
                </button>
              )}
              {confirmDelete && (
                <>
                  <button
                    className="btn btn-danger fw-bold"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn fw-bold ms-1"
                    style={{
                      background: "var(--color-green2)",
                      color: "var(--color-white)",
                    }}
                    onClick={handleDelete}
                  >
                    Confirm
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EventControlPanel;
