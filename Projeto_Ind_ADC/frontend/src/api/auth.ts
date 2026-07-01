import type { SignInData, LogInData } from "../utils/types";
import type { RequestEventList, EventListResponse} from "../utils/types";
import type { RequestEventCreation, EventCreationResponse } from "../utils/types";
import type { RequestEventGetter, EventGetterResponse } from "../utils/types";

//========== USER ==========

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

//TODO
export const getProfile = async () => {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};

//========== EVENT ==========

export const createEvent = async (
  data: RequestEventCreation
): Promise<EventCreationResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/events/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify( data ),
  });

  if (!res.ok) {
    throw new Error("Failed to create an event");
  }

  const json: EventCreationResponse = await res.json();

  return json;
};


export const getEvent = async (data: RequestEventGetter): Promise<EventGetterResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/events/get`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error("Failed to get an event");
  }

  const json: EventGetterResponse = await res.json();
  return json;
};


export const getEventList = async (
  data: RequestEventList
): Promise<EventListResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/events/list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: data }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch event list");
  }

  const json: EventListResponse = await res.json();

  return json;
};