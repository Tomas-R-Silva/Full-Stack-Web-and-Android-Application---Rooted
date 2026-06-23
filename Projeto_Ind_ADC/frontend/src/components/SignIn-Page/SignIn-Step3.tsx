import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { StepProps } from "../../utils/types";
import { registerUser } from "../../api/auth";
import SignInModal from "./SignIn-Modal";

function SignInStep3({ formData, setFormData, onBack }: StepProps) {
  const categories = [
    "🌳 Environment",
    "❤️ Well-being",
    "🤝 Inclusion",
    "🎨 Culture",
    "📚 Education",
    "⚾ Sports",
    "💻 Innovation",
    "⛑️ Vollunteer",
  ];

  //========== Hook ==========
  const [, setErrors] = useState({});
  const [showSignIn, setShowSignIn] = useState(false);

  const navigate = useNavigate();
  const [response, setResponse] = useState<any>(null);

  //const handleChange = (category: string) => {
  //setFormData((prev) => ({
  //...prev,
  //categories: prev.categories.includes(category)
  //? prev.categories.filter((c) => c !== category)
  //: [...prev.categories, category],
  //}));
  //};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log(formData);
      const response = await registerUser(formData);
      setResponse(response);
      console.log(response);
      setShowSignIn(true);
    } catch (err) {
      setResponse(err);
      setErrors(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <>
      <h5 className="text-center mb-3" style={{ color: "var(--color-green)" }}>
        Your interests:
      </h5>
      <form onSubmit={handleSubmit}>
        <div className="row g-2">
          {categories.map((category) => (
            <div className="col-6" key={category}>
              <input
                type="checkbox"
                className="btn-check"
                id={`btn-${category}`}
                //checked={formData.categories.includes(category)}
                //onChange={() => handleChange(category)}
                autoComplete="off"
              />
              <label
                className="btn w-100"
                htmlFor={`btn-${category}`}
                style={
                  {
                    //background: formData.categories.includes(category)
                    //</div>? "var(--color-green)"
                    //: "var(--color-white)",
                    //color: formData.categories.includes(category)
                    //? "var(--color-white)"
                    //: "var(--color-green)",
                  }
                }
              >
                {category}
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
