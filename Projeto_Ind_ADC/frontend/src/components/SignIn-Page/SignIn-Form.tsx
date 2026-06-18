import { useState } from "react";
import type { SignInFormData } from "../../utils/types";
import SignInStep1 from "./SignIn-Step1";
import SignInStep2 from "./SignIn-Step2";
import SignInStep3 from "./SignIn-Step3";
import SignInProgress from "./SignIn-Progress";

function SignInForm() {
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

  const [step, setStep] = useState(1);

  //========== Auxiliar Functions ==========
  const nextStep = () => setStep((prev) => prev + 1);
  const lastStep = () => setStep((prev) => prev - 1);

  //========== Return ==========
  return (
    <div style={{ width: "100%" }}>
      <h1
        className="text-center fw-bold mb-4"
        style={{
          color: "var(--color-green)",
          fontSize: "clamp(22px, 4vw, 32px)",
        }}
      >
        Let's create your account.
      </h1>
      <SignInProgress step={step} />
      {step === 1 && (
        <SignInStep1
          formData={formData}
          setFormData={setFormData}
          onNext={nextStep}
        />
      )}
      {step === 2 && (
        <SignInStep2
          formData={formData}
          setFormData={setFormData}
          onNext={nextStep}
          onBack={lastStep}
        />
      )}
      {step === 3 && (
        <SignInStep3
          formData={formData}
          setFormData={setFormData}
          onBack={lastStep}
        />
      )}
    </div>
  );
}

export default SignInForm;
