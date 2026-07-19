import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { StepProps } from "../../utils/types";
import { registerUser } from "../../api/auth";
import SignInModal from "./SignIn-Modal";
import { useNotification } from "../NotificationContext";

function SignInStep3({ formData, setFormData, onBack }: StepProps) {
  const categories = [
    { value: "MUSIC", label: "🎺 Music" },
    { value: "SPORTS", label: "⚾ Sports" },
    { value: "TECH", label: "💻 Tech" },
    { value: "ART", label: "🎨 Art" },
    { value: "FOOD", label: "🥗 Food" },
    { value: "BUSINESS", label: "💼 Business" },
    { value: "COMMUNITY", label: "🤝 Community" },
    { value: "OTHER", label: "Other" },
  ];

  //========== Hook ==========
  const [, setErrors] = useState({});
  const [showSignIn, setShowSignIn] = useState(false);
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [response, setResponse] = useState<any>(null);

  const handleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      input: {
        ...prev.input,
        category: prev.input.category.includes(value)
          ? prev.input.category.filter((c) => c !== value)
          : [...prev.input.category, value],
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log(formData);
      const response = await registerUser(formData);
      setResponse(response);
      console.log(response);
      setShowSignIn(true);
      notify("ACCOUNT_CREATED");
    } catch (err) {
      setResponse(err);
      setErrors(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  console.log(formData);

  return (
    <>
      <h5 className="text-center mb-3" style={{ color: "var(--color-green)" }}>
        Your interests:
      </h5>
      <form onSubmit={handleSubmit}>
        <div className="row g-2">
          {categories.map(({ value, label }) => (
            <div className="col-6" key={value}>
              <input
                type="checkbox"
                className="btn-check"
                id={`btn-${value}`}
                checked={formData.input.category.includes(value)}
                onChange={() => handleChange(value)}
                autoComplete="off"
              />

              <label
                className="btn w-100"
                htmlFor={`btn-${value}`}
                style={{
                  background: formData.input.category.includes(value)
                    ? "var(--color-green)"
                    : "var(--color-white)",
                  color: formData.input.category.includes(value)
                    ? "var(--color-white)"
                    : "var(--color-green)",
                }}
              >
                {label}
              </label>
            </div>
          ))}
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
              border: "3px solid var(--color-green)",
              background: "var(--color-white)",
              color: "var(--color-green)",
            }}
          >
            Sign In
          </button>
        </div>
      </form>
      {showSignIn && (
        <SignInModal onClose={() => setShowSignIn(false)} response={response} />
      )}
    </>
  );
}

export default SignInStep3;
