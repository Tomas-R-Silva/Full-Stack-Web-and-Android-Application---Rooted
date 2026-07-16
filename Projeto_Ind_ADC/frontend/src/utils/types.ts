//========== USER ==========

export type RequestSignIn = {
  input:{
    username: string;
    password: string;
    email: string;
    confirmation: string;
    category: string[];
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
      role: string,
      issuedAt: number,
      expiresAt: number,
    }
  }
};

export type RequestLogOut = {
  token: {jwt:string;}
  input: {
    username:string;
  }
}

export type LogOutResponse = {
  status: number,
  data: {message:string;}
}

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

export type RequestShowUserRole = {
   token: {jwt:string},
   input: {username:string,}
}

export type ShowUserRoleResponse = {
  status: number,
  data: User,
}

export type User = {
  username: string,
  display: string,
  email: string,
  role: string,
}

export interface UserProps {
 user: User;
}

export type RequestModAccount = {
  token: {jwt:string;}
  input: {
    username:string,
    country: string,
    birth: number,
    bio:string,
    email:string,
  }
}

export type ModAccountResponse = {
  status: number,
  data: {message:string;}
}


export type RequestUserInformation = {
  token: {jwt:string;}
  input: {
    username:string;
  }
}

export type UserInformationResponse = {
  status: number,
  data: {
    username: string,
    email: string,
    role: string,
    creation_time: number,
    birth: number,
    display: string,
    bio: string,
    country: string,
    category: string[],
    oldnames: string[],
    friendship: string,
  }
}

export type RequestFindUser = {
  token: {jwt:string;}
  input: {
    username:string;
  }
}

export type FindUserResponse = {
  status: number,
  data: {
    found: User[]}
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

export type RequestAddNickname = {
  token: {jwt:string;}
  input: {
    username:string;
    newname:string;
   }
}

export type AddNicknameResponse = {
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
  data: {friends:Requester[];}
}

export type Requester = {
  From: string,
  "Sent At": number,
}

export type RequestAuthSessions = {
  token: {jwt:string;}
}

export type AuthSessionsResponse = {
  status: number,
  data: {tokens:TokenType[];}
}

export type TokenType = {
  jwt: string,
  username: string,
  role: string,
  issuedAt: number,
  expiresAt: number,
}

//========== EVENT ==========

export type EventItem = {
  eventId: string;
  title: string;
  description: string;
  category: string;
  location: string;
  lat: number;
  lng: number;
  startDate: number;
  durationMinutes: number;
  organizerUsername: string;
  maxAttendees: number;
  minAttendees: number;
  attendeeCount: number;
  isPublic: boolean;
  status: string;
  createdAt: number;
  partners: string[];
  imageUrls: Image[];
  isAccessible: boolean,
  SDG: number[]
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
  public: boolean,
  accessible: boolean,
  sdg: number[]
  }
};

export type EventCreationResponse = {
  status: number,
  data:{eventId: string,
  message: string,}
};

export type RequestEventGetter = {
  token?: {jwt:string;}
  input: {eventId:string;}
}

export type EventGetterResponse = {
  status: number,
  data:{event: EventItem}
}

export type RequestEventList = {
  token?: {jwt:string;}
  input:{
    category: string | null;
    status: string | null;
    organizerUsername: string | null;
    pageSize: number | null;
    cursor: string | null;
    isAccessible: boolean | null,
    sdg: number[]},
};

export type EventListResponse = {
  status: number,
  data:{events: EventItem[];
  count: number;
  nextCursor?: string;
  }
};

export type RequestEventUpdate = {
  token: {jwt:string;}
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
    isAccessible?: boolean,
    sdg?: number[]
  }
}

export type EventUpdateResponse = {
  status: number,
  data:{message: string},
}

export type RequestEventCancel = {
  token: {jwt:string;}
  input: {eventId:string;}
}

export type EventCancelResponse = {
  status: number,
  data:{message: string},
}

export type RequestEventDelete = {
  token: {jwt:string;}
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

export type RequestJoinRequests = {
  token?: {jwt:string;}
  input: {eventId:string;}
}

export type JoinRequestsResponse = {
  status: number,
  data:{requests: JoinRequests[]},
  count: number,
}

export type JoinRequests = {
  requester: string,
  requestedAt: number,
}

export type RequestRespondJoin = {
  token?: {jwt:string;}
  input: {
    eventId:string;
    username: string;
    accept: boolean;
  }
}

export type RespondJoinResponse = {
  status: number,
  data:{message: string},
}

export type RequestEventUnattend = {
  token: {jwt:string;}
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

export type Attendee = {
  username: string, 
  joinedAt: number,
}

export type RequestIsAttendee = {
  token: {jwt:string;}
  input: {username:string,
    eventId: string,
  },
}

export type IsAttendeeResponse = {
  status: number,
  data:{
    isattendee: boolean,
  }
}

export type RequestUserAttends = {
  token: {jwt:string;}
  input: {username:string},
}

export type UserAttendsResponse = {
  status: number,
  data:{
    myattends: Attends[],
    count: number,
  },
}

export type Attends = {
  eventId: string,
  joinedAt: number,
}

export type RequestImageUpload = {
  token?: {jwt:string;}
  input: {eventId:string,
    images: string[],
  },
}

export type ImageUploadResponse = {
  status: number,
  data:{
    imageUrls: Image[],
    message: string
  },
}

export type RequestImageUploadURL = {
  token?: {jwt:string;}
  input: {eventId:string,
    images: string[],
  },
}

export type ImageUploadURLResponse = {
  status: number,
  data:{
    imageUrls: Image[],
    message: string
  },
}

export type Image = {
  id: string,
  url: string,
}

export type RequestImageDelete = {
  token?: {jwt:string;}
  input: {eventId:string,
    imageIds: string[],
  },
}

export type ImageDeleteResponse = {
  status: number,
  data:{message: string},
}

export type FilterProps = {
  category: string | null;
  status: string | null;
  organizerUsername: string | null;
  isAccessible: boolean | null;
  sdg: number[] | null;
};

//========== Forum ==========

export type RequestPostMessage = {
  token?: {jwt:string}
  input: {
    id: string,
    type: string,
    text: string,
    parentPostId: string,
  },
}

export type PostMessageResponse = {
  status:number,
  data:{
    postId: string,
    eventId: string,
    authorUsername: string,
    text: string,
    createdAt: number,
    parentPostId?: string,
  }
}

export type RequestListMessages = {
  token?: {jwt:string},
  input:{
    id: string,
    type: string,
    pageSize?: number,
    cursor?: string,
  }
}

export type ListMessagesResponse = {
  status:number,
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
  status:number,
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

//========== Borders ==========

export type BorderItem = {
  id:string,
  name: string,
  image: string,
  value: number,
  valueType: string,
}