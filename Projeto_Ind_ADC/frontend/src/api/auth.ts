import type { SignInData, LogInData } from "../utils/types";
import type { RequestEventCreation, EventCreationResponse } from "../utils/types";
import type { RequestEventGetter, EventGetterResponse } from "../utils/types";
import type { RequestEventList, EventListResponse} from "../utils/types";
import type { RequestEventUpdate, EventUpdateResponse} from "../utils/types";
import type { RequestEventCancel, EventCancelResponse} from "../utils/types";
import type { RequestEventDelete, EventDeleteResponse} from "../utils/types";
import type { RequestEventAttend, EventAttendResponse} from "../utils/types";
import type { RequestEventUnattend, EventUnattendResponse} from "../utils/types";
import type { RequestEventAttendees, EventAttendeesResponse} from "../utils/types";
import type { RequestImageUpload, ImageUploadResponse} from "../utils/types";
import type { RequestImageDelete, ImageDeleteResponse} from "../utils/types";

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


export const getEvent = async (
  data: RequestEventGetter
): Promise<EventGetterResponse> => {
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


export const updateEvent = async (
  data: RequestEventUpdate
): Promise<EventUpdateResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/events/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error("Failed to update an event");
  }

  const json: EventUpdateResponse = await res.json();
  return json;
};


export const cancelEvent = async (
  data: RequestEventCancel
): Promise<EventCancelResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/events/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error("Failed to cancel an event");
  }

  const json: EventCancelResponse = await res.json();
  return json;
};


export const deleteEvent = async (
  data: RequestEventDelete
): Promise<EventDeleteResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/events/delete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error("Failed to delete an event");
  }

  const json: EventDeleteResponse = await res.json();
  return json;
};


export const attendEvent = async (
  data: RequestEventAttend
): Promise<EventAttendResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/events/attend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error("Failed to attend an event");
  }

  const json: EventAttendResponse = await res.json();
  return json;
};


export const unattendEvent = async (
  data: RequestEventUnattend
): Promise<EventUnattendResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/events/unattend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error("Failed to unattend an event");
  }

  const json: EventUnattendResponse = await res.json();
  return json;
};


export const attendeesEvent = async (
  data: RequestEventAttendees
): Promise<EventAttendeesResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/events/attendees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error("Failed to list attendees an event");
  }

  const json: EventAttendeesResponse = await res.json();
  return json;
};


export const uploadImage = async (
  data: RequestImageUpload
): Promise<ImageUploadResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/events/uploadimages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error("Failed to upload an image");
  }

  const json: ImageUploadResponse = await res.json();
  return json;
};


export const deleteImage = async (
  data: RequestImageDelete
): Promise<ImageDeleteResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/events/deleteimages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error("Failed to delete an image");
  }

  const json: ImageDeleteResponse = await res.json();
  return json;
};