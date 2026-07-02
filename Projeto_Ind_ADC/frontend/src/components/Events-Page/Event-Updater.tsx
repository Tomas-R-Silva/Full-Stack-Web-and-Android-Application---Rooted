import type {
  EventItem,
  RequestEventUpdate,
  EventUpdateResponse,
} from "../../utils/types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateEvent } from "../../api/auth";

type UpdateProps = {
  onClose: () => void;
  event: EventItem;
  field: keyof RequestEventUpdate["input"];
};

type ErrorState = {
  [K in keyof RequestEventUpdate["input"]]: string;
};

function EventUpdater({ onClose, event, field }: UpdateProps) {
  const [formData, setFormData] = useState<RequestEventUpdate>({
    token: { jwt: "" },
    input: {
      eventId: event.eventId,
      title: event.title,
      description: event.description,
      category: event.category,
      location: event.location,
      startDate: event.startDate,
      durationMinutes: -event.durationMinutes,
      maxAttendees: event.maxAttendees,
      minAttendees: 0,
      public: event.isPublic,
      coverImageUrl: event.coverImageUrl,
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
    coverImageUrl: "",
  });

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

  //========== Submissão dos Campos ==========
  const handleSubmit = async (e: React.FormEvent) => {
    console.log("submit");
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
      coverImageUrl: "",
    };

    switch (field) {
      case "title":
        if (!formData.input.title) {
          newErrors.title = "Title is required";
        } else if (formData.input.title.length > 100) {
          newErrors.title = "Must be less than 100 characters";
        }
        break;

      case "description":
        if (!formData.input.description) {
          newErrors.description = "Description is required";
        }
        break;

      case "location":
        if (!formData.input.location) {
          newErrors.location = "Location is required";
        }
        break;

      case "category":
        if (!formData.input.category) {
          newErrors.category = "Category is required";
        }
        break;

      case "startDate":
        if (formData.input.startDate <= 0) {
          newErrors.startDate = "Start date is required";
        }
        break;

      case "durationMinutes":
        if (formData.input.durationMinutes <= 0) {
          newErrors.durationMinutes = "Duration must be greater than 0";
        }
        break;

      case "maxAttendees":
        if (formData.input.maxAttendees <= 0) {
          newErrors.maxAttendees = "Max attendees must be greater than 0";
        } else if (
          formData.input.minAttendees > 0 &&
          formData.input.maxAttendees < formData.input.minAttendees
        ) {
          newErrors.maxAttendees =
            "Max attendees cannot be less than min attendees";
        }
        break;

      case "minAttendees":
        if (formData.input.minAttendees <= 0) {
          newErrors.minAttendees = "Min attendees must be greater than 0";
        } else if (
          formData.input.maxAttendees > 0 &&
          formData.input.minAttendees > formData.input.maxAttendees
        ) {
          newErrors.minAttendees =
            "Min attendees cannot be greater than max attendees";
        }
        break;

      case "coverImageUrl":
        if (
          formData.input.coverImageUrl &&
          !/^https?:\/\/.+/.test(formData.input.coverImageUrl)
        ) {
          newErrors.coverImageUrl = "Please enter a valid URL";
        }
        break;

      case "public":
        break;
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
      const payload: RequestEventUpdate = {
        ...formData,
        token: {
          jwt: token,
        },
      };
      console.log(payload);
      const response = await updateEvent(payload);
      console.log(response);
      onClose;
      navigate("/events/" + event.eventId);
      window.location.reload();
    } catch (err) {
      console.log("Something went wrong!");
    }
  };

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
              Update {field}:
            </h5>

            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div
            className="modal-body"
            style={{
              background: "var(--color-bege)",
            }}
          >
            <label className="form-label is-invalid">
              Write the new {field} here:
            </label>
            {field === "public" ? (
              <input
                type="checkbox"
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
            ) : (
              <>
                <input
                  type="text"
                  name={field}
                  className={`form-control ${errors[field] ? "is-invalid" : ""}`}
                  value={formData.input[field]}
                  onChange={handleChange}
                  placeholder={"New " + field}
                />
                {errors[field] && (
                  <div className="invalid-feedback">{errors[field]}</div>
                )}
              </>
            )}
            <button
              className="btn rounded-pill mt-2"
              style={{
                background: "var(--color-green)",
                color: "var(--color-white)",
              }}
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventUpdater;
