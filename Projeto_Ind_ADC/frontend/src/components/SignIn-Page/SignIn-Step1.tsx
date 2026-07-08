import { useState } from "react";
import type { StepProps } from "../../utils/types";

function SignInStep1({ formData, setFormData, onNext }: StepProps) {
  //========== Hook ==========
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmation: "",
  });

  //========== Receber Input e Limpar erros ==========
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      input: {
        ...prev.input,
        [name]: value,
      },
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  //========== Submissão dos Campos ==========
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { email: "", password: "", confirmation: "" };

    if (!formData.input.email) {
      newErrors.email = "Email is required";
    } else if (!formData.input.email.includes("@")) {
      newErrors.email = "Invalid Email";
    }
    if (!formData.input.password) newErrors.password = "Password is required";
    if (!formData.input.confirmation) {
      newErrors.confirmation = "Please confirm your password";
    } else if (formData.input.confirmation !== formData.input.password) {
      newErrors.confirmation = "Passwords do not match";
    }

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error !== "");
    if (hasErrors) return;

    onNext?.();
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label is-invalid">Email</label>
          <input
            type="text"
            name="email"
            className={`form-control  ${errors.email ? "is-invalid" : ""}`}
            value={formData.input.email}
            onChange={handleChange}
            placeholder="Example@email.com"
          />
          {errors.email && (
            <div className="invalid-feedback">{errors.email}</div>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            className={`form-control  ${errors.password ? "is-invalid" : ""}`}
            value={formData.input.password}
            onChange={handleChange}
            placeholder="Use a strong password"
          />
          {errors.password && (
            <div className="invalid-feedback">{errors.password}</div>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            name="confirmation"
            className={`form-control  ${errors.confirmation ? "is-invalid" : ""}`}
            value={formData.input.confirmation}
            onChange={handleChange}
            placeholder="Re-enter your password"
          />
          {errors.confirmation && (
            <div className="invalid-feedback">{errors.confirmation}</div>
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

export default SignInStep1;
