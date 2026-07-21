export type NotificationCode =
  | "LOGIN_SUCCESS"
  | "INVALID_CREDENTIALS"
  | "INVALID_FILE"
  | "ACCOUNT_CREATED"
  | "ACCOUNT_DELETED"
  | "ACCOUNT_UPDATED"
  | "AVATAR_UPDATED"
  | "PASSWORD_CHANGED"
  | "MAX_SDG"
  | "EVENT_CREATED"
  | "EVENT_UPDATED"
  | "EVENT_COMPLETED"
  | "EVENT_CANCELED"
  | "EVENT_DELETED"
  | "EVENT_ATTENDED"
  | "EVENT_ATTENDED_REQUEST"
  | "EVENT_PENDING_REQUEST"
  | "EVENT_UNATTENDED"
  | "PARTNER_ADDED"
  | "PARTNER_REMOVED"
  | "PARTNER_ROLE_SETTED"
  | "FRIEND_REQUEST_ACCEPTED"
  | "FRIEND_REQUEST_REJECTED"
  | "FRIEND_REQUEST_SENDED"
  | "UNFRIEND"
  | "NICKNAME_ADDED"
  | "USER_KICKED"
  | "MESSAGE_DELETED"
  | "MESSAGE_POSTED"
  | "BORDER_CHANGED"
  | "ERROR";

export type NotificationData = {
  title: string;
  message: string;
};

export const notificationMessages: Record<NotificationCode, NotificationData> = {
  LOGIN_SUCCESS: {
    title: "Welcome!",
    message: "Logged in successfully.",
  },
  INVALID_CREDENTIALS: {
    title: "Invalid Credentials",
    message: "Your credentials are wrong. Try again!.",
  },
  INVALID_FILE: {
    title: "Invalid File",
    message: "You have sumbited a invalid file. Try again!",
  },
  ACCOUNT_CREATED: {
    title: "Success!",
    message: "Your account was created.",
  },
  ACCOUNT_DELETED: {
    title: "Success!",
    message: "Account deleted with sucess.",
  },
  ACCOUNT_UPDATED: {
    title: "Saved!",
    message: "Account updated successfully.",
  },
  AVATAR_UPDATED: {
    title: "Avatar Updated",
    message: "Your account avatar updated successfully.",
  },
  PASSWORD_CHANGED: {
    title: "Password Updated",
    message: "Your password has been changed.",
  },
  MAX_SDG: {
    title: "Max SDG",
    message: "There is a limit of 5 SDG per event.",
  },
  EVENT_CREATED: {
    title: "Event Created",
    message: "Your event is now live.",
  },
  EVENT_UPDATED: {
    title: "Event Updated",
    message: "Changes saved successfully.",
  },
  EVENT_COMPLETED: {
    title: "Event Completed",
    message: "The event has been completed & points awarded.",
  },
  EVENT_CANCELED    : {
    title: "Event Canceled",
    message: "The event has been canceled.",
  },
  EVENT_DELETED: {
    title: "Event Deleted",
    message: "The event has been removed.",
  },
  EVENT_ATTENDED: {
    title: "Event Attended",
    message: "You are now attending to the event.",
  },
  EVENT_ATTENDED_REQUEST: {
    title: "Event Attend Request",
    message: "You request to attend to the event.",
  },
  EVENT_PENDING_REQUEST: {
    title: "Event Pending Request",
    message: "You already have a pending request.",
  },
  EVENT_UNATTENDED: {
    title: "Event Unattended",
    message: "You are no more attending to the event.",
  },
  PARTNER_ADDED: {
    title: "Partner Added",
    message: "A partner has been added.",
  },
  PARTNER_REMOVED: {
    title: "Partner Removed",
    message: "A partner has been removed.",
  },
  PARTNER_ROLE_SETTED: {
    title: "Partner Role Updated",
    message: "The account partner role has been updated.",
  },
  FRIEND_REQUEST_ACCEPTED: {
    title: "Friend Request Accepted",
    message: "Now you are friends!",
  },
  FRIEND_REQUEST_REJECTED: {
    title: "Friend Request Sended",
    message: "The friend request has been rejected.",
  },
  FRIEND_REQUEST_SENDED: {
    title: "Friend Request Sended",
    message: "The friend request has been sended.",
  },
  UNFRIEND: {
    title: "Unfriend",
    message: "You are no longer friends.",
  },
  USER_KICKED: {
    title: "User Kicked",
    message: "The user has been kicked.",
  },
  NICKNAME_ADDED: {
    title: "Nickname Added",
    message: "Your friend now has a new nickname!",
  },
  MESSAGE_DELETED: {
    title: "Message Delete",
    message: "Message deleted successfully.",
  },
  MESSAGE_POSTED: {
    title: "Message Post",
    message: "Message posted successfully.",
  },
  BORDER_CHANGED: {
    title: "Border Changed",
    message: "Border changed successfully.",
  },
  ERROR: {
    title: "Oops!",
    message: "Something went wrong.",
  },
};