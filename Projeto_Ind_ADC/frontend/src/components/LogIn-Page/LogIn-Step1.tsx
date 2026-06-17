import { useState } from "react";
import type { StepProps } from "../../utils/types";
import { useNavigate } from "react-router-dom";

function LogInStep1({ formData, setFormData }: StepProps) {
  //========== Hook ==========
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  //========== Receber Input e Limpar erros ==========
  const navigate = useNavigate();

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  //========== Submissão dos Campos ==========
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { email: "", password: "", confirmation: "" };

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!formData.email.includes("@")) {
      newErrors.email = "Invalid Email";
    }
    if (!formData.password) newErrors.password = "Password is required";

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error !== "");
    if (hasErrors) return;

    console.log(formData);
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
            value={formData.email}
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
            value={formData.password}
            onChange={handleChange}
            placeholder="Use a strong password"
          />
          {errors.password && (
            <div className="invalid-feedback">{errors.password}</div>
          )}
        </div>
        <div className="d-flex justify-content-center mt-3">
          <button
            type="submit"
            className="btn rounded-pill"
            style={{
              border: "3px solid var(--color-green)",
              background: "var(--color-white)",
              color: "var(--color-green)",
            }}
          >
            Log In
          </button>
        </div>
        <div
          className="flex-grow-1 mx-2 mt-3"
          style={{
            background: "var(--color-green)",
            height: 2,
            marginBottom: 20,
          }}
        />
        <p className="text-center">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signin")}
            style={{
              color: "var(--color-green)",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Sign Up
          </span>
        </p>
      </form>
    </>
  );
}

export default LogInStep1;
