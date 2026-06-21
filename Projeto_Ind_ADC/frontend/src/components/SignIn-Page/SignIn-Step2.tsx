import { useState } from "react";
import type { StepProps } from "../../utils/types";

function SignInStep2({ formData, setFormData, onNext, onBack }: StepProps) {
  //========== Hook ==========
  const [errors, setErrors] = useState({
    username: "",
    phone: "",
    address: "",
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

    const newErrors = { username: "", phone: "", address: "" };

    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.phone) newErrors.phone = "Phone is required";
    if (!formData.address) newErrors.address = "Address is required";

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error !== "");
    if (hasErrors) return;

    onNext?.();
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label is-invalid">Username</label>
          <input
            type="text"
            name="username"
            className={`form-control  ${errors.username ? "is-invalid" : ""}`}
            value={formData.username}
            onChange={handleChange}
            placeholder="Your name here"
          />
          {errors.username && (
            <div className="invalid-feedback">{errors.username}</div>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Phone</label>
          <input
            type="tel"
            name="phone"
            className={`form-control  ${errors.phone ? "is-invalid" : ""}`}
            value={formData.phone}
            onChange={handleChange}
            placeholder="Your phone number here"
          />
          {errors.phone && (
            <div className="invalid-feedback">{errors.phone}</div>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Address</label>
          <input
            type="text"
            name="address"
            className={`form-control  ${errors.address ? "is-invalid" : ""}`}
            value={formData.address}
            onChange={handleChange}
            placeholder="Your address here"
          />
          {errors.address && (
            <div className="invalid-feedback">{errors.address}</div>
          )}
        </div>
        <div className="d-flex justify-content-between mt-3">
          <button
            onClick={() => onBack?.()}
            className="btn rounded-pill"
            style={{
              background: "var(--color-green)",
              color: "var(--color-bege)",
            }}
          >
            Last Section
          </button>
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

export default SignInStep2;
