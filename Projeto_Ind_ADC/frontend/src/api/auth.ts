import type {RequestSignIn, SignInResponse} from "../utils/types";
import type {RequestLogIn, LogInResponse} from "../utils/types";
import type {RequestLogOut, LogOutResponse} from "../utils/types";
import type {RequestShowUsers, ShowUsersResponse} from "../utils/types";
import type {RequestModAccount, ModAccountResponse} from "../utils/types";
import type {RequestUserInformation, UserInformationResponse} from "../utils/types";
import type {RequestChangePassword, ChangePasswordResponse} from "../utils/types";
import type {RequestChangeRole, ChangeRoleResponse} from "../utils/types";
import type {RequestDeleteAccount, DeleteAccountResponse} from "../utils/types";
import type {RequestAddFriend, AddFriendResponse} from "../utils/types";
import type {RequestUnfriend, UnfriendResponse} from "../utils/types";
import type {RequestFriendsList, FriendsListResponse} from "../utils/types";
import type {RequestFriendsRequests, FriendsRequestsResponse} from "../utils/types";
import type {RequestAuthSessions, AuthSessionsResponse} from "../utils/types";
import type { RequestEventCreation, EventCreationResponse } from "../utils/types";
import type { RequestEventGetter, EventGetterResponse } from "../utils/types";
import type { RequestEventList, EventListResponse} from "../utils/types";
import type { RequestEventUpdate, EventUpdateResponse} from "../utils/types";
import type { RequestEventCancel, EventCancelResponse} from "../utils/types";
import type { RequestEventDelete, EventDeleteResponse} from "../utils/types";
import type { RequestEventAttend, EventAttendResponse} from "../utils/types";
import type { RequestEventUnattend, EventUnattendResponse} from "../utils/types";
import type { RequestEventAttendees, EventAttendeesResponse} from "../utils/types";
import type { RequestIsAttendee, IsAttendeeResponse} from "../utils/types";
import type { RequestUserAttends, UserAttendsResponse } from "../utils/types";
import type { RequestImageUpload, ImageUploadResponse} from "../utils/types";
import type { RequestImageDelete, ImageDeleteResponse} from "../utils/types";
import type { RequestPostMessage, PostMessageResponse} from "../utils/types";
import type { RequestMessageDelete, MessageDeleteResponse} from "../utils/types";
import type { RequestListMessages, ListMessagesResponse} from "../utils/types";

const handleTokenExpiration = (status:number) => {
  if (status === 9904) {
    removeToken();
    window.location.replace("/login");
    throw new Error("Session expired");
  }
} 

//========== USER ==========

export const registerUser = async (
  data: RequestSignIn
): Promise<SignInResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/createaccount`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify( data ),
  });

  if (!res.ok && res.status === 200) throw new Error((await res.json()).message);
  handleTokenExpiration(res.status);

  const json: SignInResponse = await res.json();

  return json;
};


export const loginUser = async (
  data: RequestLogIn
): Promise<LogInResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok && res.status === 200) throw new Error((await res.json()).message);
  handleTokenExpiration(res.status);

  const json: LogInResponse = await res.json();

  return json;
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


export const logoutUser = async (
  data: RequestLogOut
): Promise<LogOutResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok && res.status === 200) throw new Error((await res.json()).message);
  handleTokenExpiration(res.status);

  const json: LogOutResponse = await res.json();

  return json;
};


export const getUsers = async (
  data: RequestShowUsers
): Promise<ShowUsersResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/showusers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok && res.status === 200) throw new Error((await res.json()).message);
  handleTokenExpiration(res.status);

  const json: ShowUsersResponse = await res.json();

  return json;
};


export const modAccount = async (
  data: RequestModAccount
): Promise<ModAccountResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/modaccount`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok && res.status === 200) throw new Error((await res.json()).message);
  handleTokenExpiration(res.status);

  const json: ModAccountResponse = await res.json();

  return json;
};


export const getUser = async (
  data: RequestUserInformation
): Promise<UserInformationResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok && res.status === 200) throw new Error((await res.json()).message);
  handleTokenExpiration(res.status);

  const json:UserInformationResponse = await res.json();

  return json;
};


export const changePassword = async (
  data: RequestChangePassword
): Promise<ChangePasswordResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/changeuserpwd`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok && res.status === 200) throw new Error((await res.json()).message);
  handleTokenExpiration(res.status);

  const json: ChangePasswordResponse = await res.json();

  return json;
};


export const changeRole = async (
  data: RequestChangeRole
): Promise<ChangeRoleResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/changeuserrole`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok && res.status === 200) throw new Error((await res.json()).message);
  handleTokenExpiration(res.status);

  const json: ChangeRoleResponse = await res.json();

  return json;
};

export const deleteAccount = async (
  data: RequestDeleteAccount
): Promise<DeleteAccountResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/deleteaccount`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok && res.status === 200) throw new Error((await res.json()).message);
  handleTokenExpiration(res.status);

  const json: DeleteAccountResponse = await res.json();

  return json;
};


export const addFriend = async (
  data: RequestAddFriend
): Promise<AddFriendResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/addfriend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok && res.status === 200) {
    throw new Error("Failed to add friend");
  }
  handleTokenExpiration(res.status);

  const json: AddFriendResponse = await res.json();
  return json;
};


export const unfriend = async (
  data: RequestUnfriend
): Promise<UnfriendResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/unfriend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok && res.status === 200) {
    throw new Error("Failed to unfriend");
  }
  handleTokenExpiration(res.status);

  const json: UnfriendResponse = await res.json();
  return json;
};


export const getFriendsList = async (
  data: RequestFriendsList
): Promise<FriendsListResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/showfriends`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok && res.status === 200) {
    throw new Error("Failed to list friends");
  }
  handleTokenExpiration(res.status);

  const json: FriendsListResponse = await res.json();
  return json;
};


export const getFriendsRequests = async (
  data: RequestFriendsRequests
): Promise<FriendsRequestsResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/showfriendrequests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok && res.status === 200) {
    throw new Error("Failed to friends requests");
  }
  handleTokenExpiration(res.status);

  const json: FriendsRequestsResponse = await res.json();
  return json;
};


export const getAuthSessions = async (
  data: RequestAuthSessions
): Promise<AuthSessionsResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/showauthsessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok && res.status === 200) {
    throw new Error("Failed to show auth sessions.");
  }
  handleTokenExpiration(res.status);

  const json: AuthSessionsResponse = await res.json();
  return json;
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
    body: JSON.stringify(data),
  });

  if (!res.ok && res.status === 200) {
    throw new Error("Failed to create an event");
  }
  handleTokenExpiration(res.status);

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

  if (!res.ok && res.status === 200) {
    throw new Error("Failed to get an event");
  }
  handleTokenExpiration(res.status);

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
    body: JSON.stringify(data),
  });

  if (!res.ok && res.status === 200) {
    throw new Error("Failed to fetch event list");
  }
  handleTokenExpiration(res.status);

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

  if (!res.ok && res.status === 200) {
    throw new Error("Failed to update an event");
  }
  handleTokenExpiration(res.status);

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

  if (!res.ok && res.status === 200) {
    throw new Error("Failed to cancel an event");
  }
  handleTokenExpiration(res.status);

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

  if (!res.ok && res.status === 200) {
    throw new Error("Failed to delete an event");
  }
  handleTokenExpiration(res.status);

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

  if (!res.ok && res.status === 200) {
    throw new Error("Failed to attend an event");
  }
  handleTokenExpiration(res.status);

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

  if (!res.ok && res.status === 200) {
    throw new Error("Failed to unattend an event");
  }
  handleTokenExpiration(res.status);

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

  if (!res.ok && res.status === 200) {
    throw new Error("Failed to list attendees an event");
  }
  handleTokenExpiration(res.status);

  const json: EventAttendeesResponse = await res.json();
  return json;
};


export const isAttendee = async (
  data: RequestIsAttendee
): Promise<IsAttendeeResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/events/isattendee`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok && res.status === 200) {
    throw new Error("Failed to check if it is attendee of an event");
  }
  handleTokenExpiration(res.status);

  const json: IsAttendeeResponse = await res.json();
  return json;
};


export const UserAttends = async (
  data: RequestUserAttends
): Promise<UserAttendsResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/events/myattends`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok && res.status === 200) {
    throw new Error("Failed to get user attends");
  }
  handleTokenExpiration(res.status);

  const json: UserAttendsResponse = await res.json();
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

  if (!res.ok && res.status === 200) {
    throw new Error("Failed to upload an image");
  }
  handleTokenExpiration(res.status);

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

  if (!res.ok && res.status === 200) {
    throw new Error("Failed to delete an image");
  }
  handleTokenExpiration(res.status);

  const json: ImageDeleteResponse = await res.json();
  return json;
};


//========== Forum ==========


export const PostMessage = async (
  data: RequestPostMessage
): Promise<PostMessageResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/forum/post`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok && res.status === 200) {
    throw new Error("Failed to create a posts");
  }
  handleTokenExpiration(res.status);

  const json: PostMessageResponse = await res.json();
  return json;
};


export const DeleteMessage = async (
  data: RequestMessageDelete
): Promise<MessageDeleteResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/forum/delete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok && res.status === 200) {
    throw new Error("Failed to delete a post");
  }
  handleTokenExpiration(res.status);

  const json: MessageDeleteResponse = await res.json();
  return json;
};


export const ListMessages = async (
  data: RequestListMessages
): Promise<ListMessagesResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/forum/list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok && res.status === 200) {
    throw new Error("Failed to list the posts");
  }
  handleTokenExpiration(res.status);

  const json: ListMessagesResponse = await res.json();
  return json;
};