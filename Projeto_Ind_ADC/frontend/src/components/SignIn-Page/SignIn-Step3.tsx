import type { StepProps } from "../../utils/types";

function SignInStep3({ formData, setFormData, onBack }: StepProps) {
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="text"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            placeholder="Example@email.com"
          />
        </div>
        <div>
          <label className="form-label">Password</label>
          <input
            type="text"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            placeholder="Use a strong password"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            name="confirmation"
            className="form-control"
            value={formData.confirmation}
            onChange={handleChange}
            placeholder="Re-enter your password"
          />
        </div>
        <div>
          <button onClick={() => onBack?.()}>Last Section</button>
          <button onClick={() => console.log(formData)}>Submit</button>
        </div>
      </form>
    </>
  );
}

export default SignInStep3;
