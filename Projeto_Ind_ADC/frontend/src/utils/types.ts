//========== USER ==========

export type RequestSignIn = {
  input:{
    username: string;
    password: string;
    email: string;
    confirmation: string;
    role: string;
  }
};

export type SignInResponse = {
  status: number,
  data: {
    username: string,
    role: string,
  }
};

export type RequestLogIn = {
  input:{
    username: string,
    password: string,
  }
}

export type LogInResponse = {
  status: number,
  data: {
    token:{
      jwt:string,
      username: string,
      email: string,
      role: string,
      issuedAt: number,
      expiresAt: number,
    }
  }
};

export interface AccountProps {
  image?: ImageBitmap;
  bio?: string;
  onNext?: () => void; //? retira a obrgatoriedade de fazer parte
  onBack?: () => void;
};

export interface StepProps{
  formData: RequestSignIn;
  setFormData: React.Dispatch<React.SetStateAction<RequestSignIn>>;
  onNext?: () => void; //? retira a obrgatoriedade de fazer parte
  onBack?: () => void;
};

export type RequestShowUsers = {
   token: {jwt:string;}
}

export type ShowUsersResponse = {
  status: number,
  data: {users:User[]}
}

export type User = {
  username: string,
  email: string,
  role: string,
}

export interface UserProps {
 user: User;
}

export type RequestModAccount = {
  token: {jwt:string;}
  input: {
    username:string;
    email:string,
    country?: string,
    birth?: number,
  }
}

export type ModAccountResponse = {
  status: number,
  data: {message:string;}
}

export type RequestChangePassword = {
  token: {jwt:string;}
  input: {
    username:string;
    oldpassword: string,
    newpassword: string,
  }
}

export type ChangePasswordResponse = {
  status: number,
  data: {message:string;}
}

export type RequestChangeRole = {
  token: {jwt:string;}
  input: {
    username:string;
    newrole: string,
  }
}

export type ChangeRoleResponse = {
  status: number,
  data: {message:string;}
}

export type RequestDeleteAccount = {
  token: {jwt:string;}
  input: {
    username:string;
  }
}

export type DeleteAccountResponse = {
  status: number,
  data: {message:string;}
}

export type RequestAddFriend = {
  token: {jwt:string;}
  input: {username:string;}
}

export type AddFriendResponse = {
  status: number,
  data: {message:string;}
}

export type RequestUnfriend = {
  token: {jwt:string;}
  input: {username:string;}
}

export type UnfriendResponse = {
  status: number,
  data: {message:string;}
}

export type RequestFriendsList = {
  token: {jwt:string;}
  input: {username:string;}
}

export type FriendsListResponse = {
  status: number,
  data: {friends:Friend[];}
}

export type Friend = {
  Friend: string,
  Start: number,
}

export type RequestFriendsRequests = {
  token: {jwt:string;}
}

export type FriendsRequestsResponse = {
  status: number,
  data: {friends:Friend[];}
}

export type RequestAuthSessions = {
  token: {jwt:string;}
}

export type AuthSessionsResponse = {
  status: number,
  data: {tokens:TokenType[];}
}

export type TokenType = {
  tokenID: string,
  username: string,
  role: string,
  expiresAt: number,
}

//========== EVENT ==========

export type EventItem = {
  eventId: string;
  title: string;
  description: string;
  category: string;
  location: string;
  startDate: number;
  durationMinutes: number;
  organizerUsername: string;
  maxAttendees: number;
  attendeeCount: number;
  isPublic: boolean;
  status: string;
  createdAt: number;
  coverImageUrl?: string;
  imageUrls: string[];
};

export type EventProps = {
  event: EventItem
}

export type RequestEventCreation = {
  token: { jwt: string },
  input:{
  title: string,
  description: string,
  category: string,
  location: string,
  startDate: number,
  durationMinutes: number,
  maxAttendees: number,
  minAttendees: number,
  public: boolean
  }
};

export type EventCreationResponse = {
  eventId: string,
  message: string,
};

export type RequestEventGetter = {
  token?: {jwt:String;}
  input: {eventId:String;}
}

export type EventGetterResponse = {
  status: number,
  data:{event: EventItem}
}

export type RequestEventList = {
  token?: {jwt:string;}
  input:{category?: string;
  status?: string;
  organizerUsername?: string;
  pageSize: number;
  cursor?: string;},
};

export type EventListResponse = {
  status: number,
  data:{events: EventItem[];
  count: number;
  nextCursor?: string;
  }
};

export type RequestEventUpdate = {
  token?: {jwt:string;}
  input: {
    eventId:string,
    title: string,
    description: string,
    category: string,
    location: string,
    startDate: number,
    durationMinutes: number,
    maxAttendees: number,
    minAttendees: number,
    public: boolean,
    coverImageUrl?: string,
  }
}

export type EventUpdateResponse = {
  status: number,
  data:{message: string},
}

export type RequestEventCancel = {
  token?: {jwt:string;}
  input: {eventId:string;}
}

export type EventCancelResponse = {
  status: number,
  data:{message: string},
}

export type RequestEventDelete = {
  token?: {jwt:string;}
  input: {eventId:string;}
}

export type EventDeleteResponse = {
  status: number,
  data:{message: string},
}

export type RequestEventAttend = {
  token?: {jwt:string;}
  input: {eventId:string;}
}

export type EventAttendResponse = {
  status: number,
  data:{message: string},
}

export type RequestEventUnattend = {
  token?: {jwt:string;}
  input: {eventId:string;}
}

export type EventUnattendResponse = {
  status: number,
  data:{message: string},
}

export type RequestEventAttendees = {
  token?: {jwt:string;}
  input: {eventId:string;}
}

export type EventAttendeesResponse = {
  status: number,
  data:{attendees: Attendee[],
        count: number},
}

type Attendee = {
  username: string, 
  joinedAt: number,
}

export type RequestIsAttendee = {
  token?: {jwt:string;}
  input: {username:string,
    eventId: string,
  },
}

export type IsAttendeeResponse = {
  status: number,
  data:{
    eventId: boolean,
  }
}

export type RequestImageUpload = {
  token?: {jwt:string;}
  input: {eventId:string,
    imageUrls: string[],
  },
}

export type ImageUploadResponse = {
  status: number,
  data:{
    imageUrls: string[],
    message: string
  },
}

export type RequestImageDelete = {
  token?: {jwt:string;}
  input: {eventId:string,
    imageUrls: string[],
  },
}

export type ImageDeleteResponse = {
  status: number,
  data:{message: string},
}

export type FilterProps = {
  filter: string;
};

//========== Forum ==========

export type RequestPostMessage = {
  token?: {jwt:string}
  input: {eventId:string,
    text: string,
    parentPostId: string,
  },
}

export type PostMessageResponse = {
  postId: string,
  eventId: string,
  authorUsername: string,
  text: string,
  createdAt: number,
  parentPostId?: string,
}

export type RequestListMessages = {
  token?: {jwt:string},
  input:{eventId: string,
  pageSize?: number,
  cursor?: string,}
}

export type ListMessagesResponse = {
  data:{posts: Post[],
  count: number,
  nextCursor?: string,},
}

export type Post = {
  postId: string,
  eventId: string,
  authorUsername: string,
  text: string,
  createdAt: number,
  parentPostId?: string,
}

export type RequestMessageDelete = {
  token?: {jwt:string}
  input: string,
}

export type MessageDeleteResponse = {
  data:{message: string},
}

export type MessageProps = {
  text: string,
  parentText?: string,
  postId?: string,
  authorUsername: string,
  eventOrganizer: string,
  createdAt: number,
  setParentId: React.Dispatch<React.SetStateAction<string>>;
  setParentText: React.Dispatch<React.SetStateAction<string>>;
}

export type ChatProps = {
  eventId: string,
  cursor?: string,
}

//========== SDG ==========

export type SdgItem = {
  id: number;
  title: string;
  image?: string;
  href: string;
  description?: string;
  spinner?: string;
  circle?: string;
  photo?: string;
  icon?: string;
};