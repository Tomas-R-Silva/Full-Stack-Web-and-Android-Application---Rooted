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

export type RequestEventList = {
  token?: {jwt:String;}
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
