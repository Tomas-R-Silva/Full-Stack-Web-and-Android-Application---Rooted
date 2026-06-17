import { useState } from "react";
import type { SignInFormData } from "../../utils/types";
import LogInStep1 from "./LogIn-Step1";

function LogInForm() {
  //========== Hooks ==========
  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    password: "",
    confirmation: "",
    username: "",
    phone: "",
    address: "",
    categories: [],
  });

  //========== Return ==========
  return (
    <div style={{ width: "100%", maxWidth: "30%" }}>
      <h1
        className="text-center fw-bold mb-4"
        style={{ color: "var(--color-green)", fontSize: 32 }}
      >
        Log In into Rooted
      </h1>
      <LogInStep1 formData={formData} setFormData={setFormData} />
    </div>
  );
}

export default LogInForm;
