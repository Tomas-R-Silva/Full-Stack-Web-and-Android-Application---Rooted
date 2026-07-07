import { useState } from "react";
import type { RequestLogIn } from "../../utils/types";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/auth";
import { useAuth } from "../AuthContext";

function LogInStep1() {
  //========== Hook ==========
  const [formData, setFormData] = useState<RequestLogIn>({
    input: {
      username: "",
      password: "",
    },
  });

  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });

  //========== Receber Input e Limpar erros ==========
  const { login } = useAuth();
  const navigate = useNavigate();

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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { username: "", password: "", confirmation: "" };

    if (!formData.input.username) {
      newErrors.username = "username is required";
    }
    if (!formData.input.password) newErrors.password = "Password is required";

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error !== "");
    if (hasErrors) return;

    try {
      const response = await loginUser(formData);
      const token = response.data.token.jwt;
      const username = response.data.token.username;
      const role = response.data.token.role;
      console.log(response);
      login(token, username, role);
      navigate("/#");
    } catch (err) {
      console.log(err);
    }
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
            value={formData.input.username}
            onChange={handleChange}
            placeholder="Your username"
          />
          {errors.username && (
            <div className="invalid-feedback">{errors.username}</div>
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
