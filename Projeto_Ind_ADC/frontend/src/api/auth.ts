import type { SignInFormData } from "../utils/types";

export const registerUser = async (formData: SignInFormData) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/createaccount`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData), //TODO wrong json
  });

  if (!res.ok) throw new Error((await res.json()).message);

  return res.json();
};