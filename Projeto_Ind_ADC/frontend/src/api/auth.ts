import type { SignInData } from "../utils/types";
import type { LogInData } from "../utils/types";

export const registerUser = async (data: SignInData) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/createaccount`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: data }),
  });

  if (!res.ok) throw new Error((await res.json()).message);

  return res.json();
};

export const loginUser = async (data: LogInData) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: data }),
  });

  if (!res.ok) throw new Error((await res.json()).message);

  return res.json();
};

export const saveToken = (token: string) => {
  sessionStorage.setItem("token", token);
};

export const getToken = () => {
  return sessionStorage.getItem("token");
};

export const removeToken = () => {
  sessionStorage.removeItem("token");
};

export const isAuthenticated = () => {
  return !!sessionStorage.getItem("token");
};

export const getProfile = async () => {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};