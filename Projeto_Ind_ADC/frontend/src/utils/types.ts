//========== USER ==========

export type SignInData = {
  username: string;
  password: string;
  email: string;
  confirmation: string;
  role: string;
};

export type LogInData = {
  username: string;
  password: string;
};

export interface AccountProps {
  image?: ImageBitmap;
  bio?: string;
  onNext?: () => void; //? retira a obrgatoriedade de fazer parte
  onBack?: () => void;
};

export interface StepProps{
  formData: SignInData;
  setFormData: React.Dispatch<React.SetStateAction<SignInData>>;
  onNext?: () => void; //? retira a obrgatoriedade de fazer parte
  onBack?: () => void;
};

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
  data:{event: EventItem}
}

export type RequestEventList = {
  token?: {jwt:string;}
  category?: string;
  status?: string;
  organizerUsername?: string;
  pageSize: number;
  cursor?: string;
};

export type EventListResponse = {
  data:{events: EventItem[];
  count: number;
  nextCursor?: string;
  }
};

export type RequestEventUpdate = {
  token?: {jwt:String;}
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
  data:{message: string},
}

export type RequestEventCancel = {
  token?: {jwt:string;}
  input: {eventId:string;}
}

export type EventCancelResponse = {
  data:{message: string},
}

export type RequestEventDelete = {
  token?: {jwt:string;}
  input: {eventId:string;}
}

export type EventDeleteResponse = {
  data:{message: string},
}

export type RequestEventAttend = {
  token?: {jwt:string;}
  input: {eventId:string;}
}

export type EventAttendResponse = {
  data:{message: string},
}

export type RequestEventUnattend = {
  token?: {jwt:string;}
  input: {eventId:string;}
}

export type EventUnattendResponse = {
  data:{message: string},
}

export type RequestEventAttendees = {
  token?: {jwt:string;}
  input: {eventId:string;}
}

export type EventAttendeesResponse = {
  data:{attendees: Attendee[],
        count: number},
}

type Attendee = {
  username: string, 
  joinedAt: number,
}

export type RequestImageUpload = {
  token?: {jwt:string;}
  input: {eventId:string,
    imageUrls: string[],
  },
}

export type ImageUploadResponse = {
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
  eventId: string,
  pageSize?: number,
  cursor?: string,
}

export type ListMessagesResponse = {
  posts: Post[],
  count: number,
  nextCursor?: string,
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
}

export type ChatProps = {
  eventId: string,
  cursor?: string,
}

//========== SDO ==========

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