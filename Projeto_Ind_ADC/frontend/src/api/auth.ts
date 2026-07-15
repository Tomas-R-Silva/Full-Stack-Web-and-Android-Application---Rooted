import type {RequestSignIn, SignInResponse} from "../utils/types";
import type {RequestLogIn, LogInResponse} from "../utils/types";
import type {RequestLogOut, LogOutResponse} from "../utils/types";
import type {RequestShowUsers, ShowUsersResponse} from "../utils/types";
import type {RequestModAccount, ModAccountResponse} from "../utils/types";
import type {RequestUserInformation, UserInformationResponse} from "../utils/types";
import type {RequestFindUser, FindUserResponse} from "../utils/types";
import type {RequestChangePassword, ChangePasswordResponse} from "../utils/types";
import type {RequestChangeRole, ChangeRoleResponse} from "../utils/types";
import type {RequestDeleteAccount, DeleteAccountResponse} from "../utils/types";
import type {RequestAddFriend, AddFriendResponse} from "../utils/types";
import type {RequestAddNickname, AddNicknameResponse} from "../utils/types";
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
import type {JoinRequestsResponse, RequestJoinRequests} from "../utils/types";
import type {RespondJoinResponse, RequestRespondJoin} from "../utils/types";
import type { RequestEventUnattend, EventUnattendResponse} from "../utils/types";
import type { RequestEventAttendees, EventAttendeesResponse} from "../utils/types";
import type { RequestIsAttendee, IsAttendeeResponse} from "../utils/types";
import type { RequestUserAttends, UserAttendsResponse } from "../utils/types";
import type { RequestImageUpload, ImageUploadResponse} from "../utils/types";
import type { RequestImageUploadURL, ImageUploadURLResponse} from "../utils/types";
import type { RequestImageDelete, ImageDeleteResponse} from "../utils/types";
import type { RequestPostMessage, PostMessageResponse} from "../utils/types";
import type { RequestMessageDelete, MessageDeleteResponse} from "../utils/types";
import type { RequestListMessages, ListMessagesResponse} from "../utils/types";

const handleTokenExpiration = (status: number) => {
  if (status === 9904) {
    removeToken();
    window.location.replace("/login");
    throw new Error("Session expired");
  }
};

const apiRequest = async <T>(
  endpoint: string,
  data: unknown
): Promise<T> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  handleTokenExpiration(json.status);

  if (!res.ok) {
    throw new Error(json.message);
  }

  return json as T;
};


//========== TOKEN ==========

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


//========== USER ==========

export const registerUser = (data: RequestSignIn) =>
  apiRequest<SignInResponse>("/createaccount", data);

export const loginUser = (data: RequestLogIn) =>
  apiRequest<LogInResponse>("/login", data);

export const logoutUser = (data: RequestLogOut) =>
  apiRequest<LogOutResponse>("/logout", data);

export const getUsers = (data: RequestShowUsers) =>
  apiRequest<ShowUsersResponse>("/showusers", data);

export const modAccount = (data: RequestModAccount) =>
  apiRequest<ModAccountResponse>("/modaccount", data);

export const getUser = (data: RequestUserInformation) =>
  apiRequest<UserInformationResponse>("/user", data);

export const findUser = (data: RequestFindUser) =>
  apiRequest<FindUserResponse>("/user", data);

export const changePassword = (data: RequestChangePassword) =>
  apiRequest<ChangePasswordResponse>("/changeuserpwd", data);

export const changeRole = (data: RequestChangeRole) =>
  apiRequest<ChangeRoleResponse>("/changeuserrole", data);

export const deleteAccount = (data: RequestDeleteAccount) =>
  apiRequest<DeleteAccountResponse>("/deleteaccount", data);

export const addFriend = (data: RequestAddFriend) =>
  apiRequest<AddFriendResponse>("/addfriend", data);

export const addNickName = (data: RequestAddNickname) =>
  apiRequest<AddNicknameResponse>("/addnickname", data);

export const unfriend = (data: RequestUnfriend) =>
  apiRequest<UnfriendResponse>("/unfriend", data);

export const getFriendsList = (data: RequestFriendsList) =>
  apiRequest<FriendsListResponse>("/showfriends", data);

export const getFriendsRequests = (data: RequestFriendsRequests) =>
  apiRequest<FriendsRequestsResponse>("/showfriendrequests", data);

export const getAuthSessions = (data: RequestAuthSessions) =>
  apiRequest<AuthSessionsResponse>("/showauthsessions", data);

//========== EVENT ==========

export const createEvent = (data: RequestEventCreation) =>
  apiRequest<EventCreationResponse>("/events/create", data);

export const getEvent = (data: RequestEventGetter) =>
  apiRequest<EventGetterResponse>("/events/get", data);

export const getEventList = (data: RequestEventList) =>
  apiRequest<EventListResponse>("/events/list", data);

export const updateEvent = (data: RequestEventUpdate) =>
  apiRequest<EventUpdateResponse>("/events/update", data);

export const cancelEvent = (data: RequestEventCancel) =>
  apiRequest<EventCancelResponse>("/events/cancel", data);

export const deleteEvent = (data: RequestEventDelete) =>
  apiRequest<EventDeleteResponse>("/events/delete", data);

export const attendEvent = (data: RequestEventAttend) =>
  apiRequest<EventAttendResponse>("/events/attend", data);

export const requestsJoinEvent = (data: RequestJoinRequests) =>
  apiRequest<JoinRequestsResponse>("/events/joinrequests", data);

export const respondJoinEvent = (data: RequestRespondJoin) =>
  apiRequest<RespondJoinResponse>("/events/respondjoin", data);

export const unattendEvent = (data: RequestEventUnattend) =>
  apiRequest<EventUnattendResponse>("/events/unattend", data);

export const attendeesEvent = (data: RequestEventAttendees) =>
  apiRequest<EventAttendeesResponse>("/events/attendees", data);

export const isAttendee = (data: RequestIsAttendee) =>
  apiRequest<IsAttendeeResponse>("/events/isattendee", data);

export const UserAttends = (data: RequestUserAttends) =>
  apiRequest<UserAttendsResponse>("/events/myattends", data);

export const uploadImage = (data: RequestImageUpload) =>
  apiRequest<ImageUploadResponse>("/events/uploadimages", data);

export const uploadImageURL = (data: RequestImageUploadURL) =>
  apiRequest<ImageUploadURLResponse>("/events/uploadimageurls", data);

export const deleteImage = (data: RequestImageDelete) =>
  apiRequest<ImageDeleteResponse>("/events/deleteimage", data);


//========== Forum ==========

export const PostMessage = (data: RequestPostMessage) =>
  apiRequest<PostMessageResponse>("/forum/post", data);

export const DeleteMessage = (data: RequestMessageDelete) =>
  apiRequest<MessageDeleteResponse>("/forum/delete", data);

export const ListMessages = (data: RequestListMessages) =>
  apiRequest<ListMessagesResponse>("/forum/list", data);